function CoordMapType(tileSize) {
  this.tileSize = tileSize;
}
function TrafficMapType(trafficeSize) {
  this.tileSize = tileSize;
}

TrafficMapType.prototype.maxZoom = 19;
TrafficMapType.prototype.name = 'Traffic';
TrafficMapType.prototype.alt = 'Traffic Map Type';

TrafficMapType.prototype.getMapTypeId = function(coord, zoom, ownerDocument) {
  var div = ownerDocument.createElement('div');
  div.innerHTML = coord;
  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  div.style.fontSize = '10';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px';
  div.style.borderColor = '#AAAAAA';
  div.style.backgroundColor = '#E5E3DF';
  return div;
}

// function setTrafficLayer() {
//   var trafficLayer = new google.maps.TrafficLayer();
//   trafficLayer.setMap(map);
// };

// function setTransitLayer() {
//   var transitLayer = new google.maps.TransitLayer();
//   transitLayer.setMap(map);
// };

// function setBikeLayer() {
//   var bikeLayer = new google.maps.BicyclingLayer();
//   bikeLayer.setMap(map);
// };

CoordMapType.prototype.maxZoom = 19;
CoordMapType.prototype.name = 'Tiles';
CoordMapType.prototype.alt = 'Tile Coordinate Map Type';

CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var div = ownerDocument.createElement('div');
  div.innerHTML = coord;
  div.style.width = this.tileSize.width + 'px';
  div.style.height = this.tileSize.height + 'px';
  div.style.fontSize = '10';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px';
  div.style.borderColor = '#AAAAAA';
  div.style.backgroundColor = '#E5E3DF';
  return div;
};


function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_LEFT,
      mapTypeIds: ['roadmap', 'coordinate', 'satellite', 'hybrid', 'terrain', 'traffic']
    },
    trafficViewControl: true,
    trafficViewControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT
    },
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: true,
    center: {lat: 40.8136, lng: -96.7026},
    zoom: 15
  });

  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map); 

  map.addListener('maptypeid_changed', function() {
    var showStreetViewControl = map.getMapTypeId() !== 'coordinate';
    map.setOptions({
      streetViewControl: showStreetViewControl
    });
  });

  map.mapTypes.set('coordinate', 
    new CoordMapType(new google.maps.Size(256,256)));


  new AutocompleteDirectionsHandler(map);

  // let c = map.getCenter();
  // jQuery.cookies.set("center", c.lat() + ','
  //   + c.lng() + ',' + map.getZoom(),
  //                       cookieOptions);
  
  getCenter(map);

}

function getCenter(map) {
  console.log('test');
  let temp = map.getCenter();
  console.log(temp);
}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'WALKING';
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
