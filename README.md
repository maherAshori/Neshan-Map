# Neshan-Map
Angularjs Directive for Neshan map (neshan.org) service - https://developers.neshan.org

# Step 1: sources

````
<link href="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css" rel="stylesheet" type="text/css">

<script src="https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js" type="text/javascript"></script>

<script src="neshan.js"></script>
````

# Step 2: define app & add Neshan Directive

```` var app = angular.module("app", ["Neshan"]);````

# Step 3: configs your map

````
    app.config(function(neshanProvider) {
      neshanProvider.configs({
          mapKey: "web.**",
          serviceKey: "service.**",
          defaultCenter: [35.6997793747305, 51.337409038769465],
          mapType: "neshan",
          timeoutReady: 0,
          zoomControl: false,
          searchPlaceholderText: "search",
          zoom: 16,
          activeMarker: true,
          singleMarker: true,
          search: true,
          poi: true,
          traffic: true
      });
    });
 ````
<table width="100%">
  <tr>
    <th>config</th>
    <th>description</th>
    <th width="15%">type</th>
    <th width="10%">default</th>
    <th>required</th>
  </tr>
  <tr>
    <td>mapKey</td>
    <td>used for display neshan map for free (https://neshan.org)</td>
    <td>string</td>
    <td>-</td>
    <td>true</td>
  </tr>
  <tr>
    <td>defaultCenter</td>
    <td>used for display map center on view</td>
    <td>array</td>
    <td>-</td>
    <td>true</td>
  </tr>
  <tr>
    <td>serviceKey</td>
    <td>used for calling neshan api (primary)</td>
    <td>string</td>
    <td>-</td>
    <td>false</td>
  </tr>  
  <tr>
    <td>mapType</td>
    <td>used for map style (Types: [dreamy, dreamy-gold, neshan, standard-day, standard-night, osm-bright])</td>
    <td>string</td>
    <td>'standard-day'</td>
    <td>true</td>
  </tr> 
  <tr>
    <td>poi</td>
    <td>show/hide points on map</td>
    <td>bool</td>
    <td>false</td>
    <td>false</td>
  </tr>  
  <tr>
    <td>traffic</td>
    <td>show/hide traffic roads on map</td>
    <td>bool</td>
    <td>false</td>
    <td>false</td>
  </tr>  
  <tr>
    <td>zoom</td>
    <td>used for default zoom on map</td>
    <td>int</td>
    <td>12</td>
    <td>false</td>
  </tr>
  <tr>
    <td>zoomControl</td>
    <td>show/hide (+/-) zoom control from the map</td>
    <td>bool</td>
    <td>true</td>
    <td>false</td>
  </tr>  
  <tr>
    <td>activeMarker</td>
    <td>active/deactive markers from the map</td>
    <td>bool</td>
    <td>false</td>
    <td>false</td>
  </tr>  
  <tr>
    <td>singleMarker</td>
    <td>activeMarker should be true! it able to make you have multiple marker or single marker</td>
    <td>bool <div width="100%">false: multiple</div> <div>true: single</div></td>
    <td>false: multiple</td>
    <td>false</td>
  </tr> 
  <tr>
    <td>search</td>
    <td>you need a serviceKey! active search bar on map</td>
    <td>bool</td>
    <td>false</td>
    <td>false</td>
  </tr>   
  <tr>
    <td>timeoutReady</td>
    <td>used for map compiler and some other settings, may you need display the map after 20 secound</td>
    <td>int</td>
    <td>0 secound</td>
    <td>false</td>
  </tr>    
  <tr>
    <td>searchPlaceholderText</td>
    <td>used for search input text box placeholder</td>
    <td>string</td>
    <td>'place'</td>
    <td>false</td>
  </tr>     
</table> 

# Step 4: insert the neshan directive

```
    <neshan map-id="map"
            watch-map-type="watchMapType"
            output="map"
            add-marker="[35.6997793747305, 51.337409038769465]"></neshan>
            
        app.controller("ctrl", function ($scope) {
            $scope.map = {};
            $scope.watchMapType = null;

            var hour = (new Date()).getHours();

            if (hour >= 19) {
                $scope.watchMapType = "standard-night";
            }

            $scope.$watch("map", function (value) {
                console.log(value);
            }, true);
        });            
            
```
 <table width="100%">
    <tr>
      <th>directive key</th>
      <th>description</th>
      <th>default</th>
      <th>required</th>
    </tr>
    <tr>
      <td>map-id</td>
      <td>define id to map container</td>
      <td>map</td>
      <td>false</td>
    </tr>
    <tr>
      <td>output</td>
      <td>return all changes in the map, for example: return lat and lng</td>
      <td>-</td>
      <td>true</td>
    </tr>
    <tr>
      <td>add-marker</td>
      <td>add a default marker</td>
      <td>-</td>
      <td>false</td>
    </tr>  
    <tr>
      <td>watch-map-type</td>
      <td>may you want to change map to night or another types with conditions</td>
      <td>-</td>
      <td>false</td>
    </tr>    
  </table>
  
  # output:
  
  In our example we define `$scope.map = {};` as output.
  
  If we set map configs `singleMarker = true`(single marker) output will return object.
  
  If we set map configs `singleMarker = false`(multiple markers) output will return array.
  
  ````
  $scope.$watch("map", function (value) {
      //return output from directive
      console.log(value);
  }, true);
````            
  
  #  watch-map-type:
  
  If you need to change map type from day to night, you need to use this attr:
  
  In your controller:
  ````
    //get current hour:
    var hour = (new Date()).getHours();

    //if hour is bigger than 19 change mapType to your valid value
    if (hour >= 19) {
        $scope.watchMapType = "standard-night";
    }
````            
