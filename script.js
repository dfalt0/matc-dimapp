var map, infoWindow, drawingManager;
var placeIdArray = [];
var polylines = [];
var snappedCoordinates = [];

// function createMap () {
//     var a = 40.806862,
//         b = -96.6816,
//         diff = 0.0033;

//     var options = {
//         center: { lat: a, lng: b },
//         zoom: 12,
//     };

//     map = new google.maps.Map(document.getElementById('map'), options);

//     // Adds a Places search box. Searching for a place will center the location.
//     // map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
//     //     document.getElementById('bar'));
//     // var autocomplete = new google.maps.places.Autocomplete(
//     //     document.getElementById('autoc'));
//     // autocomplete.bindTo('bounds', map);
//     // autocomplete.addListener('place_changed', function() {
//     //     var place = autocomplete.getPlace();
//     //     if (place.geometry.viewport) {
//     //         map.fitBounds(place.geometry.viewport);
//     //     } else {
//     //         map.setCenter(place.geometry.location);
//     //         map.setZoom(17);
//     //     }
//     // });

//     // SEARCH BOX
//     var input = document.getElementById('search');
//     var origin = document.getElementById('origin-input');
//     var destination = document.getElementById('destination-input');
//     var searchBox = new google.maps.places.SearchBox(input);

//     map.addListener('bounds_changed', function() {
//         searchBox.setBounds(ma.getBounds());
//     });
//     map.addListener('bounds_changed', function() {
//         origin.setBounds(ma.getBounds());
//     })
//     map.addListener('bounds_changed', function() {
//         destination.setBounds(ma.getBounds());
//     })

//     var markers = [];

//     searchBox.addListener('places_changed', function() {
//         var places = searchBox.getPlaces();
        
//         if (places.length === 0)
//             return;

//         markers.forEach(function (m) { m.setMap(null); });
//         markers = [];

//         var bounds = new google.maps.LatLngBounds();

//         places.forEach(function (p) {
//             if (!p.geometry)
//             return;

//             markers.push(new google.maps.Marker({
//                 map: map,
//                 title: p.name,
//                 position: p.geometry.location
//             }));

//             if (p.geometry.viewport)
//                 bounds.union(p.geometry.viewport);
//             else
//                 bounds.extend(p.geometry.location);
//         });
//         map.fitBounds(bounds);
//     });

//     origin.addListener('places_changed', function() {
//         var places = origin.getPlaces();

//         if (places.length === 0)
//             return;
        
//         markers.forEach(function (m) { m.setMap(null); });
//         markers = [];

//         var bounds = new google.maps.LatLngBounds();

//         places.forEach(function (p) {
//             if (!p.geometry)
//                 return;
            
//             markers.push(new google.maps.Marker({
//                 map: map,
//                 title: p.name,
//                 position: p.geometry.location
//             }));

//             if (p.geometry.viewport)
//                 bounds.union(p.geometry.viewport);
//             else 
//                 bounds.extend(p.geometry.location);
//         });
//         map.fitBounds(bounds);
//     });

//     destination.addListener('places_changed', function() {
//         var places = origin.getPlaces();

//         if (places.length === 0)
//             return;
        
//         markers.forEach(function (m) { m.setMap(null); });
//         markers = [];

//         var bounds = new google.maps.LatLngBounds();

//         places.forEach(function (p) {
//             if (!p.geometry)
//                 return;
            
//             markers.push(new google.maps.Marker({
//                 map: map,
//                 title: p.name,
//                 position: p.geometry.location
//             }));

//             if (p.geometry.viewport)
//                 bounds.union(p.geometry.viewport);
//             else 
//                 bounds.extend(p.geometry.location);
//         });
//         map.fitBounds(bounds);
//     });


//     directionsDisplay.setMap(map);
//     directionsDisplay.setPanel(document.getElementById('directionsPanel'));

//     google.maps.event.addListener(directionsDisplay, "directions_changed", function() {

//     });
// }

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {lat: 40.8136, lng: -96.7026},
        zoom: 13
    });

    var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

    new AutoCompleteDirectionsHandler(map);
}

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'DRIVING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(map);
  
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
  
    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id']);
  
    var destinationAutocomplete =
        new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id']);
  
    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');
  
    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
  
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
        destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
  }
  
  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  AutocompleteDirectionsHandler.prototype.setupClickListener = function(
      id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
  
    radioButton.addEventListener('click', function() {
      me.travelMode = mode;
      me.route();
    });
  };
  
  AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(
      autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
  
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
  
      if (!place.place_id) {
        window.alert('Please select an option from the dropdown list.');
        return;
      }
      if (mode === 'ORIG') {
        me.originPlaceId = place.place_id;
      } else {
        me.destinationPlaceId = place.place_id;
      }
      me.route();
    });
  };
  
  AutocompleteDirectionsHandler.prototype.route = function() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }
    var me = this;
  
    this.directionsService.route(
        {
          origin: {'placeId': this.originPlaceId},
          destination: {'placeId': this.destinationPlaceId},
          travelMode: this.travelMode
        },
        function(response, status) {
          if (status === 'OK') {
            me.directionsRenderer.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
  };
  
  

// ----------------------------------------------------------------------------------------------------//
// function calculateAndDisplayRoute(directionsService, directionsDisplay, pointA, pointB) {
//     directionsService.route({
//         origin: pointA,
//         destination: pointB,
//         travelmode: google.maps.TravelMode.DRIVING
//     }, function(response, status) {
//         if (status == google.maps.DirectionsStatus.OK) {
//             directionsDisplay.setDirections(resposne);
//         } else {
//             window.alert('Directions request failed due to ' + status);
//         }
//     });
// }
    // Create a new directionsService object. Add two markers, point A and B. Search and create route.
    // https://stackoverflow.com/a/41171749/9628569

    // var directionsService = new google.maps.DirectionsService;
    
    // directionsService.route({
    //     origin: origin.latitude + ', ' + origin.longitude,
    //     travelMode: 'DRIVING',
    // }, function(response, status) {
    //     if (status === google.maps.DirectionsStatus.OK) {
    //         var directionsDisplay = new google.maps.DirectionsRenderer({
    //             suppressMarkers: true,
    //             map: map,
    //             directions: response,
    //             draggable: false,
    //             suppressPolylines: false, // FALSE = automatically drawn polylines
    //         });

    //         pathPoints = response.routes[0].overview_path.map(function (location) {
    //             return {lat: location.lat(), lng: location:lng()];
    //         });

    //         var assumedpath = new google.maps.Polyline({
    //             path: pathPoints, // APPLY LIST TO PATH
    //             geodesic: true,
    //             strokeColor: '#708090',
    //             strokeOpacity: 0.7,
    //             strokeWeight: 2.5
    //         });

    //         assumedPath.setMap(map); // Set the path object to the map
    //     }
    // })


    // Enables the polyline drawing control. Click on the map to start drawing a
    // polyline. Each click will add a new vertice. Double-click to stop drawing.

    // drawingManager = new google.maps.drawing.DrawingManager({
    //     drawingMode: google.mpas.drawing.overlayTpe.POLYLINE,
    //     drawingControl: true,
    //     drawingControlOptions: {
    //         position: google.maps.ControlPosition.TOP_CENTER,
    //         drawingMode: [
    //             google.maps.drawing.OverlayType.POLYLINE
    //         ]
    //     },
    //     polylineOptions: {
    //         strokeColor: '#696969',
    //         strokeWeight: 2
    //     }
    // });
    // drawingManager.setMap(map);
    
    // Snap-to-road when the polyline is completed.
    // drawingManager.addListener('polylinecomplete', function(poly) {
    //     var path = poly.getPath();
    //     polylines.push(poly);
    //     placeIdArray = [];
    //     runSnapToRoad(path);
    // });

    // // Clear button. Click to remove all polylines.
    // $('#clear').click(function(ev) {
    //     for (var i=0; i < polylines.length; ++i) {
    //         polylines[i].setMap(null);
    //     }
    //     polylines = [];
    //     ev.preventDefault();
    //     return false;
    // });

    // google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
    //     logArray(polygon.getPath());
    // });
    // google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
    //     logArray(polygon.getPath());
    // });
    

// Snap a user-created polyline to roads and draw the snapped path
// function runSnapToRoad(path) {
//     var pathValues = [];
//     for (var i=0; i < path.getLength(); i++) {
//         pathValues.push(path.getAt(i).toUrlValue());
//     }

//     $.get('https://roads.googleapis.com/v1/snapToRoads', {
//         interpolate: true,
//         key: apiKey,
//         path: pathValues.join('|')
//     }, function(data) {
//         processSnapToRoadResposne(data);
//         drawSnappedPolyline();
//         getAndDrawSpeedLimits();
//     });
// }

// Store snapped polyline returned by the snap-to-road service.
// function processSnapToRoadResponse(data) {
//     snappedCoordinates = [];
//     palceIdArray = [];
//     for (var i=0; i < data.snappedPoints.lenght; i++) {
//         var latlng = new google.maps.LatLng(
//             data.spannedPoints[i].location.latitude,
//             data.snappedPoints[i].location.longitude);
//         snappedCoordinates.push(latlng);
//         placeIdArray.push(data.snappedPoints[i].placeId);
//     }
// }

// Draws the snapped polyline (after processing snap-to-road response).
// function drawSnappedPolyline() {
//     var snappedPolyline = new google.maps.Polyline({
//         path: snappedCoordinates,
//         strokeColor: 'black',
//         strokeWeight: 3
//     });

//     snappedPolyline.setMap(map);
//     polylines.push(snappedPolyline);
// }

// Gets speed limits (for 100 segments at a time) and draws a polyline
// color-coded by speed limit. Must be called after processing


// function logArray (array) {
//     var verticies = [];

//     for (var i = 0; i < array.getLength(); i++) {
//         verticies.push({
//             lat: array.getAt(i).lat(),
//             lng: array.getAt(i).lng()
//         });
//     }


//     console.log(verticies);
// }