//Developer: Maher Ashori
//Email: maher.ashori@gmail.com
//Github: https://github.com/maherAshori/Neshan-Map
//version: 0.0.2
var app = angular.module("Neshan", []);

app.provider('neshan', function () {
    var configs = {};

    this.configs = function (params) {
        configs = params;
    };

    this.$get = function () {
        return configs;
    }
});

app.directive("neshan", ["$timeout", "$http", "neshan", function ($timeout, $http, neshan) {
    return {
        template: '<div class="map-wrapper"><form ng-if="activeSearchBox" ng-submit="startSearching()" class="input-group map-search" ng-class=\'{"on": results.length > 0}\' dir="ltr"><input type="search" placeholder="{{searchPlaceholderText}}" ng-model="output.searchTerm" class="form-control" ng-focus="inputFocus()" /><div class="search-result"><ul class="list-group p-0 m-0"><li class="list-group-item" ng-repeat="item in results" ng-click="setView(item)"><div class="clearfix d-block text-right"><h6 class="float-right m-0 text-primary">{{item.title}}</h6><h6 class="float-left m-0 text-success">{{item.region}}</h6></div><div class="clearfix d-block text-right text-muted"><small class="m-0">{{item.neighbourhood}}</small></div><div class="clearfix d-block text-right text-muted"><small>{{item.address}}</small></div></li></ul></div></form><div id="{{mapId}}" class="neshan-container"></div><div class="actions"><button class="btn btn-danger" ng-click="removeDestination()" ng-show="showDestinationButton">حذف مقصد</button><button class="btn btn-success" ng-show="showOriginButton" ng-click="removeOrigin()">حذف مبداء</button><button class="btn btn-primary ml-3" ng-show="showDestinationButton && showReverseDirection" ng-click="reverseDirection()">تغییر از مقصد به مبداء</button></div></div>',
        scope: {
            output: "=",
            mapId: "@?",
            addMarker: "=?",
            watchMapType: "=?"
        },
        link: function (scope) {
            const searchApi = "https://api.neshan.org/v1/search";
            const reverseApi = "https://api.neshan.org/v2/reverse";
            const directionApi = "https://api.neshan.org/v2/direction";

            var polylineColor = "blue";
            scope.searchPlaceholderText = neshan.searchPlaceholderText;
            scope.showReverseDirection = neshan.reverseDirection;

            if (!scope.mapId) {
                scope.mapId = "map";
            }


            if (!neshan.searchPlaceholderText) {
                scope.searchPlaceholderText = "Place";
            }

            if (!neshan.zoom) {
                neshan.zoom = 12;
            }

            if (angular.isUndefined(neshan.zoomControl)) {
                neshan.zoomControl = true;
            }

            if (!neshan.timeoutReady) {
                neshan.timeoutReady = 0;
            }

            if (neshan.search && !neshan.serviceKey) {
                console.error("serviceKey is undefined! search not work ... more information: https://neshan.org");
                return false;
            }

            $timeout(function () {
                var map = new L.Map(scope.mapId, {
                    key: neshan.mapKey,
                    poi: neshan.poi,
                    traffic: neshan.traffic,
                    center: neshan.defaultCenter,
                    zoom: neshan.zoom,
                    zoomControl: neshan.zoomControl
                });

                var originLayer = L.layerGroup().addTo(map);
                var polylineLayer = L.layerGroup().addTo(map);
                var destinationLayer = L.layerGroup().addTo(map);


                if (!neshan.mapType) {
                    map.setMapType("standard-day");
                } else {
                    map.setMapType(neshan.mapType);
                }

                //$watch input
                scope.$watch("watchMapType", function (nvalue) {
                    if (nvalue != null) {
                        map.setMapType(nvalue);
                        if (nvalue === "standard-night") {
                            polylineColor = "white";
                        }
                    }
                }, true);

                scope.output = {};

                var lat, lng, latLag = [], marker;

                if (neshan.direction) {
                    var originIcon = L.icon({
                        iconUrl: 'https://static.neshan.org/assets/angular-direction/origin.png',
                        iconSize: [60, 60]
                    });

                    var destinationIcon = L.icon({
                        iconUrl: 'https://static.neshan.org/assets/angular-direction/destination.png',
                        iconSize: [60, 60]
                    });

                    var origin, destination, polyline;

                    const getDirection = function (origin, destination) {
                        var params = { origin: [origin._latlng.lat, origin._latlng.lng], destination: [destination._latlng.lat, destination._latlng.lng] };

                        $http({
                            method: "GET",
                            url: directionApi,
                            params: params,
                            headers: {
                                'Api-Key': neshan.serviceKey
                            }
                        }).then(function (response) {
                            if (response.status === 200) {
                                const data = response.data["routes"][0]["legs"][0];

                                var decodePolylines = [];
                                var encodPolylines = [];
                                var waypoints = [];

                                angular.forEach(data.steps, function (step) {
                                    encodPolylines.push(step.polyline);
                                });

                                if (angular.isDefined(L.Polyline.fromEncoded)) {
                                    angular.forEach(encodPolylines,
                                        function (polyline) {
                                            var decode = L.Polyline.fromEncoded(polyline);

                                            angular.forEach(decode._latlngs,
                                                function (line) {
                                                    decodePolylines.push(line);
                                                });
                                        });
                                } else {
                                    console.error("please add Polyline.encoded.js file");
                                    return false;
                                }

                                angular.forEach(decodePolylines, function (polyline) {
                                    waypoints.push([polyline.lat, polyline.lng])
                                });

                                polyline = L.polyline(waypoints, { color: polylineColor }).addTo(polylineLayer);

                                map.fitBounds(polyline.getBounds());
                            }
                        });
                    }

                    map.on("click", function (e) {
                        if (origin) {
                            if (destination) {
                                scope.removeDestination();
                            }

                            destination = L.marker([e.latlng.lat, e.latlng.lng], { icon: destinationIcon }).addTo(destinationLayer);
                            scope.showDestinationButton = true;
                            scope.showOriginButton = false;

                            getDirection(origin, destination);
                        } else {
                            origin = L.marker([e.latlng.lat, e.latlng.lng], { icon: originIcon }).addTo(originLayer);
                            scope.showOriginButton = true;
                        }

                        scope.$apply();
                    });

                    if (neshan.reverseDirection) {
                        scope.reverseDirection = function () {
                            map.removeLayer(polyline);

                            var rOrigin = angular.copy(origin);
                            var rDestination = angular.copy(destination);

                            originLayer.clearLayers();
                            destinationLayer.clearLayers();
                            polylineLayer.clearLayers();

                            origin = L.marker([rDestination._latlng.lat, rDestination._latlng.lng], { icon: originIcon }).addTo(originLayer);
                            destination = L.marker([rOrigin._latlng.lat, rOrigin._latlng.lng], { icon: destinationIcon }).addTo(destinationLayer);

                            getDirection(origin, destination);
                        }
                    }

                    scope.removeDestination = function () {
                        scope.showDestinationButton = false;
                        scope.showOriginButton = true;

                        destination = undefined;
                        polyline = 
