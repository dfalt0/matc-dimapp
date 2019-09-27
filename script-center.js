let apiKey = AIzaSyB7LGFloeOgHCn9B6_w0hSfiY5vpErgYhI;
// let directionService = new google.maps.DirectionService();


function initMap() {
  var myLatlng = {
    lat: 40.8136,
    lng: -96.7026
  };

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_LEFT,
      mapTypeIds: ['roadmap', 'coordinate', 'satellite', 'hybrid', 'terrain', 'traffic']
    },
    trafficViewControl: true,
    trafficViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    zoom: 15,
    center: myLatlng
  });

  let POINTS = lat + ',' + lng;
  console.log(POINTS);

  // // Get Place
  // let placeId = 'https://roads.googleapis.com/v1/nearestRoads?points=' + POINTS + '&key=' + apiKey + '';

  // // Nearest Roads
  // let NEAREST_ROAD_URL = 'https://roads.googleapis.com/v1/nearestRoads?' +
  //   'points=' + POINTS + '&key=' + apiKey + '&placeid=' + placeId + '';

  google.maps.event.addListener(map, "center_changed", function() {
    var center = this.getCenter();
    var latitude = center.lat();
    var longitude = center.lng();

  //  let road = NEAREST_ROAD_URL;

    console.log("current latitude is: " + latitude);
    console.log("current longitude is: " + longitude);
    
    // LatLng 
    document.getElementById("lat").innerHTML = latitude;
    document.getElementById("lng").innerHTML = longitude;

    // Speed Limit Guess
    //document.getElementById("").innerHTML = null;

    // Speed Limit Guess
    //document.getElementById("nearest-road").innerHTML = road;

  });

  // directionService.route({
  //   origin: myLatlng,
  //   destination: myLatlng,
  //   travelMode: google.maps.DirectionsTravelMode.DRIVING
  // }, function (response, status) {
  //   if (status == google.maps.DirectionStatus.OK) {
  //     let homeMarker = new google.maps.Marker({
  //       position: response.routes[0].legs[0].start_location,
  //       map: map,
  //       title: "Location",
  //       icon: Image,
  //       shadow: shadow
  //     });
  //   } else {
  //     let homeMarker = new google.maps.Marker({
  //       position: myLatlng,
  //       map: map,
  //       title: "Location",
  //       icon: Image,
  //       shadow: shadow
  //     });
  //   }
  // });

}

function closestRoad(map) {

}

