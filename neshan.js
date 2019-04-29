//Developer: Maher Ashori
//Email: maher.ashori@gmail.com
//Github: https://github.com/maherAshori/Neshan-Map
//version: 0.0.1
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
        template: '<div class="map-wrapper"><form ng-if="activeSearchBox" ng-submit="startSearching()" class="input-group map-search" ng-class=\'{"on": results.length > 0}\' dir="ltr"><input type="search" placeholder="{{searchPlaceholderText}}" ng-model="output.searchTerm" class="form-control" ng-focus="inputFocus()" /><div class="search-result"><ul class="list-group p-0 m-0"><li class="list-group-item" ng-repeat="item in results" ng-click="setView(item)"><div class="clearfix d-block text-right"><h6 class="float-right m-0 text-primary">{{item.title}}</h6><h6 class="float-left m-0 text-success">{{item.region}}</h6></div><div class="clearfix d-block text-right text-muted"><small class="m-0">{{item.neighbourhood}}</small></div><div class="clearfix d-block text-right text-muted"><small>{{item.address}}</small></div></li></ul></div></form><div id="{{mapId}}" class="neshan-container"></div></div>',
        scope: {
            output: "=",
            mapId: "@?",
            addMarker: "=?",
            watchMapType: "=?"
        },
        link: function (scope) {
            const searchApi = "https://api.neshan.org/v1/search";

            scope.searchPlaceholderText = neshan.searchPlaceholderText;

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

                if (!neshan.mapType) {
                    map.setMapType("standard-day");
                } else {
                    map.setMapType(neshan.mapType);
                }

                //$watch input
                scope.$watch("watchMapType", function (nvalue) {
                    if (nvalue != null) {
                        map.setMapType(nvalue);
                    }
                }, true);

                scope.output = {};

                var lat, lng, latLag = [], marker;

                if (scope.addMarker) {
                    marker = new L.Marker([scope.addMarker[0], scope.addMarker[1]]).addTo(map);
                }

                if (neshan.activeMarker) {
                    map.on("click", function (e) {
                        scope.results = [];

                        if (neshan.singleMarker) {
                            if (marker) {
                                map.removeLayer(marker);
                            }
                        }

                        marker = new L.Marker([e.latlng.lat, e.latlng.lng]).addTo(map);

                        if (neshan.singleMarker) {
                            lat = e.latlng.lat;
                            lng = e.latlng.lng;

                            //output
                            scope.output.lat = lat;
                            scope.output.lng = lng;
                        } else {
                            latLag.push({ lat: e.latlng.lat, lng: e.latlng.lng });
                            scope.output.latLag = latLag;
                        }

                        //$apply changes
                        scope.$apply();
                    });
                }

                if (neshan.search && neshan.serviceKey) {
                    scope.activeSearchBox = true;

                    var copySearchTerm = [];
                    var copyResult = [];

                    scope.startSearching = function () {
                        var params = { term: scope.output.searchTerm, lat: lat === undefined ? neshan.defaultCenter[0] : lat, lng: lng === undefined ? neshan.defaultCenter[1] : lng };

                        $http({
                            method: "GET",
                            url: searchApi,
                            params: params,
                            headers: {
                                'Api-Key': neshan.serviceKey
                            }
                        }).then(function (response) {
                            if (response.status === 200) {
                                const data = response.data;
                                scope.results = data.items;
                                copyResult = angular.copy(data.items);
                                copySearchTerm = angular.copy(scope.output.searchTerm);
                            }
                        });
                    }

                    scope.inputFocus = function () {
                        if (scope.output.searchTerm === copySearchTerm) {
                            scope.results = copyResult;
                        }
                    }

                    scope.setView = function (item) {
                        map.setView(new L.LatLng(item.location.y, item.location.x), map.getZoom());

                        if (marker) {
                            map.removeLayer(marker);
                        }

                        marker = new L.Marker([item.location.y, item.location.x]).addTo(map);

                        scope.results = [];
                    }
                }
            }, scope.timeoutReady);
        }
    }
}]);