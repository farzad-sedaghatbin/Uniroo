App.controller('peykCtrl', function ($scope, $rootScope, landInit, $state) {

  // Create an array of styles.
  var styles = landInit.mapStyles();

  // Create a new StyledMapType object, passing it the array of styles,
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});
  var myLatlng = new google.maps.LatLng($rootScope.start_box.lat,$rootScope.start_box.lng);
  var mapOptions = {
    center: myLatlng,
    zoom: 16,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map3"),
    mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
  $scope.map = map;
  $scope.init_status = true;

  var socket = new WebSocket("wss://192.168.1.135:8080:4443/driverHandler");
  socket.onopen = function () {
    socket.send("mylocation","1,35.770412, 51.444817")
  };
  var image = 'img/icons/google_marker.png';
  var bound = new google.maps.LatLngBounds(null);
  socket.onmessage = function (msg) {
    msg.data.forEach(function (value, key) {
      var loc = new google.maps.LatLng(value.lat, value.longitude);
      var marker = new google.maps.Marker({
        position: loc,
        map: $scope.map,
        title: '',
        icon: image
      });
      marker.setVisible(true);
      bound.extend(loc);
    });
    $scope.map.fitBounds(bound);
  };
});
