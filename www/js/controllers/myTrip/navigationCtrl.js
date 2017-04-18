App.controller('navigationCtrl', function ($scope, $rootScope, landInit, $timeout) {
  // Create an array of styles.
  var styles = landInit.mapStyles();

  // Create a new StyledMapType object, passing it the array of styles,
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});
  var myLatlng = new google.maps.LatLng($rootScope.start_box.lat, $rootScope.start_box.lng);
  var mapOptions = {
    center: myLatlng,
    zoom: 16,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map2"),
    mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
  $scope.map = map;

  var startImage = 'img/source.png';
  var endImage = 'img/destination.png';

  $scope.fromMarker = new google.maps.Marker({
    map: $scope.map,
    icon: startImage
  });
  $scope.fromMarker.setPosition(myLatlng);
  $scope.fromMarker.setVisible(true);
  $scope.map.setZoom(16);
});
