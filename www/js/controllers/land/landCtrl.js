App.controller('landCtrl', function ($rootScope, $q, $http, $ionicLoading,$cordovaToast, $compile, $ionicModal, $state, $window, $timeout, $ionicPopup, landInit, WebService, $filter, $cordovaNativeAudio, $cordovaVibration) {

  $rootScope.client;

  /* Funtion For set Map
   =========================================================== */

  function set_map() {
    // Create an array of styles.
    var styles = landInit.mapStyles();

    // Create a new StyledMapType object, passing it the array of styles,
    var styledMap = new google.maps.StyledMapType(styles,
      {name: "Styled Map"});
    var myLatlng = new google.maps.LatLng(35.705097,51.385516);
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"),
      mapOptions);
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');
    $rootScope.map = map;
    $rootScope.init_status = true;
  }


  /* Function For Get place from LatLng
   ==================================================*/
  function codeLatLng(lat, lng) {
    $http({
      method: "POST",
      url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=true&language=fa"
    }).then(function (resp) {
      document.getElementById('autocompletefrom').value = resp.data.results[1].formatted_address;
      $rootScope.fromAddress = resp.data.results[1].formatted_address;
      $rootScope.Location = resp.data.results[1].formatted_address;
    }, function (err) {
      WebService.myErrorHandler(err, false);
    });
  }

  $rootScope.getCurrentLocation = function () {
    if (!$rootScope.map) {
      return;
    }
    /**/
    var image = 'img/icons/google_marker.png';
    /**/
    navigator.geolocation.getCurrentPosition(function (pos) {
      var myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      $rootScope.start_box.lat = pos.coords.latitude;
      $rootScope.start_box.lng = pos.coords.longitude;
      codeLatLng(pos.coords.latitude, pos.coords.longitude);
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: $rootScope.map,
        title: '',
        icon: image
      });
      $rootScope.map.setCenter(myLatlng);
      $ionicLoading.hide();
    }, function (error) {
      $ionicLoading.hide();
    });
  };
  $rootScope.newTrip = function () {
    resetAllThingsWithoutApply();
    if ($("#my-pop").hasClass("my-active")) {
      animateMyPop();
    }
  };
  $rootScope.deleteFrom = function () {
    $rootScope.numOfClick = 0;
    $rootScope.fromMarker.setMap(null);
    document.getElementById('autocompletefrom').value = "";
    $rootScope.markers.forEach(function (value, key) {
      value.setMap(null);
    });
  };
  $rootScope.deleteTo = function () {
    $rootScope.numOfClick = 1;
    $rootScope.toMarker.setMap(null);
    document.getElementById('autocompleteto').value = "";
  };

  $rootScope.numOfClick = 0;
  var image = 'img/MOTORCYCLE.png';
  var bound;
  $rootScope.markers = [];
  $rootScope.delivery;
  $rootScope.initialVars = function(){
    bound = new google.maps.LatLngBounds(null);
    $rootScope.delivery = new google.maps.Marker({
      icon: image
    });
    $rootScope.delivery.setVisible(false);
    fromInfowindow = new google.maps.InfoWindow();
    toInfowindow = new google.maps.InfoWindow();
    var options = {
      // componentRestrictions: {country: "in"}
      // types :['(regions)'],
      componentRestrictions: {country: "ir"}
    };
    var from_el = document.getElementById('autocompletefrom');
    var to_el = document.getElementById('autocompleteto');
    var startImage = 'img/source.png';
    var endImage = 'img/destination.png';
    $rootScope.map.addListener("click", function (event) {
      if (preventDoubleTrigger && preventDoubleTrigger.lat() == event.latLng.lat()) {
        return;
      }
      if ($rootScope.numOfClick == 0) {
        preventDoubleTrigger = event.latLng;
        $rootScope.numOfClick = 1;
        bound = new google.maps.LatLngBounds(null);
        bound.extend(event.latLng);
        $rootScope.fromMarker = new google.maps.Marker({
          map: $rootScope.map,
          icon: startImage
        });
        $rootScope.fromMarker.setPosition(event.latLng);
        $rootScope.fromMarker.setVisible(true);
        var contentString = '<div ng-click="deleteFrom()" class="myText">لغو مبدا</div>';
        var compiled = $compile(contentString)($rootScope);
        fromInfowindow.setContent(compiled[0]);
        fromInfowindow.open($rootScope.map, $rootScope.fromMarker);
        $rootScope.fromMarker.addListener('click', function () {
          toInfowindow.close();
          fromInfowindow.open($rootScope.map, $rootScope.fromMarker);
        });
        $rootScope.$apply(function () {
          $rootScope.start_box.location = '';
          $rootScope.start_box.lat = event.latLng.lat();
          $rootScope.start_box.lng = event.latLng.lng();
        });
        $http({
          method: "POST",
          url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + event.latLng.lat() + "," + event.latLng.lng() + "&sensor=true&language=fa"
        }).then(function (resp) {
          from_el.value = resp.data.results[1].formatted_address;
          $rootScope.fromAddress = resp.data.results[1].formatted_address;
        }, function (err) {
          WebService.myErrorHandler(err, false);
        });
        $rootScope.map.fitBounds(bound);
        $rootScope.client.send("aroundme," + $rootScope.userid + "," + $rootScope.start_box.lat + "," + $rootScope.start_box.lng);
      } else if ($rootScope.numOfClick == 1) {
        $rootScope.numOfClick = 2;
        bound = new google.maps.LatLngBounds(null);
        bound.extend(event.latLng);
        bound.extend($rootScope.fromMarker.getPosition());
        $rootScope.toMarker = new google.maps.Marker({
          map: $rootScope.map,
          icon: endImage
        });
        $rootScope.toMarker.setPosition(event.latLng);
        $rootScope.toMarker.setVisible(true);
        $rootScope.$apply(function () {
          $rootScope.end_box.location = '';
          $rootScope.end_box.lat = event.latLng.lat();
          $rootScope.end_box.lng = event.latLng.lng();
        });
        $http({
          method: "POST",
          url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + event.latLng.lat() + "," + event.latLng.lng() + "&sensor=true&language=fa"
        }).then(function (resp) {
          to_el.value = resp.data.results[1].formatted_address;
          $rootScope.toAddress = resp.data.results[1].formatted_address;
        }, function (err) {
          WebService.myErrorHandler(err, false);
        });
        $rootScope.map.fitBounds(bound);
        tripCalculations();
      }
    });
    $rootScope.from = new google.maps.places.Autocomplete(from_el, options);
    google.maps.event.addListener($rootScope.from, 'place_changed', function () {
      $rootScope.numOfClick = 1;
      toInfowindow.close();
      if ($rootScope.fromMarker) {
        $rootScope.fromMarker.setMap(null);
      }
      bound = new google.maps.LatLngBounds(null);
      bound.extend($rootScope.from.getPlace().geometry.location);
      $rootScope.map.fitBounds(bound);
      $rootScope.fromMarker = new google.maps.Marker({
        map: $rootScope.map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: startImage
      });
      $rootScope.fromMarker.setPosition($rootScope.from.getPlace().geometry.location);
      $rootScope.fromMarker.setVisible(true);
      $rootScope.fromMarker.addListener('click', function () {
        toInfowindow.close();
        fromInfowindow.open($rootScope.map, $rootScope.fromMarker);
      });
      var contentString = '<div ng-click="deleteFrom()" class="myText">لغو مبدا</div>';
      var compiled = $compile(contentString)($rootScope);
      fromInfowindow.setContent(compiled[0]);
      fromInfowindow.open($rootScope.map, $rootScope.fromMarker);
      $rootScope.$apply(function () {
        $rootScope.start_box.location = $rootScope.from.getPlace().formatted_address;
        $rootScope.start_box.lat = $rootScope.from.getPlace().geometry.location.lat();
        $rootScope.start_box.lng = $rootScope.from.getPlace().geometry.location.lng();
      });
      $http({
        method: "POST",
        url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + $rootScope.from.getPlace().geometry.location.lat() + "," + $rootScope.from.getPlace().geometry.location.lng() + "&sensor=true&language=fa"
      }).then(function (resp) {
        from_el.value = resp.data.results[1].formatted_address;
        $rootScope.fromAddress = resp.data.results[1].formatted_address;
      }, function (err) {
        WebService.myErrorHandler(err, false);
      });
      $rootScope.client.send("aroundme,1," + $rootScope.start_box.lat + "," + $rootScope.start_box.lng);
    });

    $rootScope.to = new google.maps.places.Autocomplete(to_el, options);
    google.maps.event.addListener($rootScope.to, 'place_changed', function () {
      $rootScope.numOfClick = 2;
      fromInfowindow.close();
      bound.extend($rootScope.to.getPlace().geometry.location);
      $rootScope.map.fitBounds(bound);
      $rootScope.toMarker = new google.maps.Marker({
        map: $rootScope.map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: endImage
      });
      $rootScope.toMarker.setPosition($rootScope.to.getPlace().geometry.location);
      $rootScope.toMarker.setVisible(true);
      $rootScope.$apply(function () {
        $rootScope.end_box.location = $rootScope.to.getPlace().formatted_address;
        $rootScope.end_box.lat = $rootScope.to.getPlace().geometry.location.lat();
        $rootScope.end_box.lng = $rootScope.to.getPlace().geometry.location.lng();
      });
      $http({
        method: "POST",
        url: "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + $rootScope.to.getPlace().geometry.location.lat() + "," + $rootScope.to.getPlace().geometry.location.lng() + "&sensor=true&language=fa"
      }).then(function (resp) {
        to_el.value = resp.data.results[1].formatted_address;
        $rootScope.toAddress = resp.data.results[1].formatted_address;
      }, function (err) {
        WebService.myErrorHandler(err, false);
      });
      tripCalculations();
    });
  }
  $rootScope.ratingsObject = {
    iconOn: 'ion-ios-star',
    iconOff: 'ion-ios-star-outline',
    iconOnColor: 'rgb(200, 200, 100)',
    iconOffColor: 'rgb(200, 100, 100)',
    rating: 0,
    minRating: 0,
    readOnly: false,
    callback: function (rating) {
      alert(rating)
    }
  };

  function resetAllThings() {
    $rootScope.$apply(function () {
      $rootScope.pop_status = 0;
      $rootScope.showDriverInfo = false;
    });
    internalReset();
  }

  function resetAllThingsWithoutApply() {
    $rootScope.pop_status = 0;
    $rootScope.showDriverInfo = false;
    internalReset();
  }

  function internalReset() {
    $rootScope.delivery.setMap(null);
    document.getElementById('autocompletefrom').value = "";
    document.getElementById('autocompleteto').value = "";
    $rootScope.fromMarker.setMap(null);
    $rootScope.toMarker.setMap(null);
    $rootScope.numOfClick = 0;
    $rootScope.markers.forEach(function (value, key) {
      value.setMap(null);
    });
    $rootScope.initialVars();
    $rootScope.enableBox = true;
    $("#footer").css("height", "44px");
  }

  var fromInfowindow;
  var toInfowindow;
  var preventDoubleTrigger;

  function animate_tab() {
    $('#tab-hide').addClass('hidden');

    $timeout(function () {
      $('#tab-hide').removeClass('hidden');
    }, 300);
  }

  $rootScope.Location = 'You are here';
  $rootScope.start_box = {'location': null, 'lat': null, 'lng': null};
  $rootScope.end_box = {'location': null, 'lat': null, 'lng': null};
  $rootScope.start_box_copy, $rootScope.end_box_copy , current_box = {}

  $rootScope.my_model;
  $rootScope.pop_status = 0;
  function prepareSocket(){
    if (!$rootScope.client || $rootScope.client.readyState === $rootScope.client.CLOSED) {
      $rootScope.client = new WebSocket("wss://migmig.cfapps.io:4443/myHandler");
      $rootScope.client.onopen = function () {
        if (!$rootScope.userid) {
          var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
          db.transaction(function (tx) {
            tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="userid"', [], function (tx, results) {
              var len = results.rows.length, i, result = '';
              if (!results.rows || results.rows.length == 0) {
                result = null;
              } else {
                result = results.rows.item(0).log;
              }
              setUserId(result)
            }, null);
          });
          var setUserId = function (result) {
            if (!result) {
              $state.go("landing")
            } else {
              $rootScope.userid = result;
              $rootScope.client.send("join," + $rootScope.userid);
            }
          };
        } else {
          $rootScope.client.send("join," + $rootScope.userid);
        }
        $rootScope.client.onmessage = function (msg) {
          var data = JSON.parse(msg.data);
          switch (data.command) {
            case "aroundme":
              data.aroundmeDTOs.forEach(function (value, key) {
                var loc = new google.maps.LatLng(value.lat, value.longitude);
                var marker = new google.maps.Marker({
                  position: loc,
                  map: $rootScope.map,
                  title: '',
                  icon: image
                });
                marker.setVisible(true);
                $rootScope.markers.push(marker);
                bound.extend(loc);
              });
              $rootScope.map.fitBounds(bound);
              break;
            case "driverinfo":
              $("#footer").css("height", "70px");
              $rootScope.$apply(function () {
                $rootScope.driver = data.driverInfoDTO;
                $rootScope.pop_status = 4;
                $rootScope.showDriverInfo = true;
              });
              $rootScope.markers.forEach(function (value, key) {
                value.setMap(null);
              });
              bound = new google.maps.LatLngBounds(null);
              bound.extend($rootScope.fromMarker.getPosition());
              bound.extend($rootScope.toMarker.getPosition());
              $ionicLoading.hide();
              break;
            case "$rootScope.delivery":
              $ionicLoading.hide();
              $rootScope.delivery.setPosition(new google.maps.LatLng(data.$rootScope.deliveryLocationDTO.lat, data.$rootScope.deliveryLocationDTO.lng));
              $rootScope.delivery.setMap($rootScope.map);
              $rootScope.delivery.setVisible(true);
              bound.extend($rootScope.delivery.getPosition());
              $rootScope.map.fitBounds(bound);
              break;
            case "reject":
              $ionicPopup.alert({
                title: '<p class="text-center color-yellow">' + $filter('langTranslate')("سفر پرید", $rootScope.appConvertedLang['FAILED']) + '</p>',
                template: '<p class="text-center color-gery">' + $filter('langTranslate')("سفر توسط راننده لغو شد.لطفا مجددا اقدام نمایید.", $rootScope.appConvertedLang['Enter_pickup_location']) + '</p>'
              });
              resetAllThings();
              break;
            case "arrived":
              $cordovaNativeAudio
                .preloadSimple('migmig', 'audio/migmig.mp3');
              $cordovaNativeAudio.play("migmig");
              $cordovaVibration.vibrate(1000);
              //todo alert
              $ionicPopup.alert({
                title: '<p class="text-center color-yellow">' + $filter('langTranslate')("راننده رسید", $rootScope.appConvertedLang['FAILED']) + '</p>',
                template: '<p class="text-center color-gery">' + $filter('langTranslate')("راننده به محل مبدا رسیده است", $rootScope.appConvertedLang['Enter_pickup_location']) + '</p>'
              });
              break;
            case "endoftrip":
              $ionicPopup.alert({
                title: '<p class="text-center color-yellow">' + $filter('langTranslate')("اتمام سفر", $rootScope.appConvertedLang['FAILED']) + '</p>',
                template: '<p class="text-center color-gery">' + $filter('langTranslate')("امتیاز شما به این سفر", $rootScope.appConvertedLang['Enter_pickup_location']) + '' +
                '<ionic-ratings ratingsobj="ratingsObject" style="font-size: xx-large;padding-top: 5%;text-align: center"></ionic-ratings></p>'
              });
              resetAllThings();
              break;
          }
        };
      };
    }
  }
  /* STARTING Point
   ================================================================*/
  if ($rootScope.init_status === undefined) {
    $.getScript("http://maps.googleapis.com/maps/api/js?key=AIzaSyBksdkjWFIfdMS_IhY8sEit6r9IPrPq-lA&sensor=true&libraries=places", function (data, textStatus, jqxhr) {
      if (typeof google === 'object' && typeof google.maps === 'object') {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.data = data;
        $("head").append(s);
        initialMainPage();
      } else {
        $cordovaToast.showShortBottom('لطفا اتصال اینترنت خود را بررسی کنید');
      }
    });
    };
  function initialMainPage(){
    prepareSocket();
    set_map();
    $rootScope.getCurrentLocation();
    $rootScope.initialVars();
    google.maps.event.trigger($rootScope.map, 'resize');
    WebService.show_loading();
  }
  document.addEventListener("online", onOnline, false);
  function onOnline() {
    if ($rootScope.init_status === undefined) {
      initialMainPage();
    }
  }
  $rootScope.CallNumber = function (number) {
    window.plugins.CallNumber.callNumber(function () {
    }, function () {
    }, number)
  };
  function animateMyPop() {
    $('#my-pop').toggleClass('my-active');
    $rootScope.Trip_Date = null;
  }

  /* RIDE NOW
   ======================================*/
  $rootScope.ride = function (time) {
    if ($rootScope.start_box.lat == null) {
      var alertPopup = $ionicPopup.alert({
        title: '<p class="text-center color-yellow">' + $filter('langTranslate')("خطا", $rootScope.appConvertedLang['FAILED']) + '</p>',
        template: '<p class="text-center color-gery">' + $filter('langTranslate')("لطفا مبدا را انتخاب نمایید", $rootScope.appConvertedLang['Enter_pickup_location']) + '</p>'
      });
      alertPopup.then(function (res) {
        console.log('');
      });
    } else if ($rootScope.end_box.lat == null) {
      alertPopup = $ionicPopup.alert({
        title: '<p class="text-center color-yellow">' + $filter('langTranslate')("خطا", $rootScope.appConvertedLang['FAILED']) + '</p>',
        template: '<p class="text-center color-gery">' + $filter('langTranslate')("لطفا مقصد را انتخاب نمایید", $rootScope.appConvertedLang['Enter_Drop_location']) + '</p>'
      });
      alertPopup.then(function (res) {

      });
    } else {
      if (time == 'later') {
        $rootScope.Trip_now = false;
        $rootScope.past_date = false;
        //$rootScope.book_date = $rootScope.Trip_Date;
        $rootScope.date_data = {};
        //if(appConvertedLang['Enter_date_and_time']!='')
        min_date = new Date().toISOString();
        var myPopup = $ionicPopup.show({
          template: '<input   class="color-yellow" placeholder="Date:" style=" background-color: #3e3e3e; padding-left:20px;width:100%; line-Height: 20px" ng-model="date_data.Trip_Date" min=' + min_date + ' type="datetime-local">' +
          '<div class="error  text-center" ng-show="past_date==true">خطا</div>',
          title: '<p class="color-yellow">' + $filter('langTranslate')("لطفا تاریخ درست را وارد نمایید", $rootScope.appConvertedLang['Enter_date_and_time']) + '</p>',
          scope: $rootScope,
          buttons: [
            {
              text: $filter('langTranslate')("Cancel", $rootScope.appConvertedLang['Cancel']),
              onTap: function (e) {
                return false;
              }
            },
            {
              text: $filter('langTranslate')("Save", $rootScope.appConvertedLang['Save']),
              onTap: function (e) {
                //alert($rootScope.date_data.Trip_Date);
                if ($rootScope.date_data.Trip_Date == null) {
                  //don't allow the user to close unless he enters wifi password
                  $rootScope.past_date = true;
                  e.preventDefault();
                } else {
                  return $rootScope.date_data.Trip_Date;
                }
              }
            }
          ]
        });
        myPopup.then(function (res) {
          if (res != false) {
            $rootScope.book_date = res;
            $rootScope.book();
          }
        });
      }
      else {
        $rootScope.Trip_now = true;
        $rootScope.book();
      }
    }
  };
  var distance = 0;
  $rootScope.enableBox = true;
  function tripCalculations() {
    $rootScope.pop_status = 1;
    var duration = 0;
    var ser = new google.maps.DirectionsService();
    ser.route({
      'origin': $rootScope.fromMarker.getPosition(),
      'destination': $rootScope.toMarker.getPosition(),
      'travelMode': google.maps.DirectionsTravelMode.DRIVING
    }, function (res, sts) {
      distance = res.routes[0].legs[0].distance.value;
      duration = res.routes[0].legs[0].duration.value;
      fromInfowindow.close();
      toInfowindow.close();
      google.maps.event.clearListeners($rootScope.map, 'click');
      google.maps.event.clearListeners($rootScope.fromMarker, 'click');
      google.maps.event.clearListeners($rootScope.toMarker, 'click');
      $rootScope.enableBox = false;
      $ionicLoading.show();
      $http({
        method: "POST",
        url: "https://migmig.cfapps.io/api/1/calculate",
        data: $rootScope.start_box.lat + "," + $rootScope.start_box.lng + "," + $rootScope.end_box.lat + "," + $rootScope.end_box.lng + "," + distance + "," + duration
      }).then(function (resp) {
        $ionicLoading.hide();
        $rootScope.cabs = resp.data;
        $rootScope.selected_cab = $rootScope.cabs[0];
        animateMyPop();
      }, function (err) {
        $ionicLoading.hide();
        WebService.myErrorHandler(err, false);
      });
    });
  }

  $rootScope.cancelTrip = function () {
    resetAllThingsWithoutApply();
    $ionicLoading.hide();
    $http({
      method: "POST",
      url: "https://migmig.cfapps.io/api/1/rejectUser",
      data: $rootScope.userid + "," + uid
    }).then(function (resp) {
    }, function (err) {
      WebService.myErrorHandler(err, false);
    });
  };
  var uid;
  $rootScope.book = function () {
    $ionicLoading.show({
      template: '<div><ion-spinner icon="lines"></ion-spinner></div>',
      showBackdrop: true,
      hideOnStateChange: false
    });
    var data;
    if ($rootScope.Trip_now) {
      data = {
        slat: $rootScope.start_box.lat,
        slng: $rootScope.start_box.lng,
        dlat: $rootScope.end_box.lat,
        dlng: $rootScope.end_box.lng,
        source: $rootScope.fromAddress,
        destination: $rootScope.toAddress,
        cost: $rootScope.selected_cab.cost,
        description: $("#moreInfo").val(),
        distance : distance
      };
      $http({
        method: "POST",
        url: "https://migmig.cfapps.io/api/1/confirmRequest",
        data: data
      }).then(function (resp) {
        uid = resp.data.tripInfo.uid;
        $ionicLoading.hide();
        $ionicLoading.show({
          template: '<div><ion-spinner icon="lines"></ion-spinner></div>' +
          '<div class="myText">درحال انتخاب راننده</div>' +
          '<button id="upperText" onclick="cancelTrip()" style="width: 60px;height:20px;border-radius: 10px;background-color: yellow ' +
          'class="button button-fab expanded button-energized-900 myText">لغو</button>',
          showBackdrop: true,
          hideOnStateChange: false
        });
      }, function (err) {
        $ionicLoading.hide();
        WebService.myErrorHandler(err, false);
      });
    } else {
      data = {
        slat: $rootScope.start_box.lat,
        slng: $rootScope.start_box.lng,
        dlat: $rootScope.end_box.lat,
        dlng: $rootScope.end_box.lng,
        source: $rootScope.fromAddress,
        destination: $rootScope.toAddress,
        cost: $rootScope.selected_cab.cost,
        year: $rootScope.date_data.Trip_Date.getFullYear(),
        month: $rootScope.date_data.Trip_Date.getMonth(),
        day: $rootScope.date_data.Trip_Date.getDate(),
        hour: $rootScope.date_data.Trip_Date.getHours(),
        minute: $rootScope.date_data.Trip_Date.getMinutes()
      };
      $http({
        method: "POST",
        url: "https://migmig.cfapps.io/api/1/confirmReserve",
        data: data
      }).then(function (resp) {
      }, function (err) {
        WebService.myErrorHandler(err, false);
      });
    }
    animateMyPop();
  };
  $rootScope.cancel = function () {
    animateMyPop();
  };
  $rootScope.clicked_item = function (index) {
    // $window.alert(item);
    $rootScope.active_cab = index;
    animate_tab();
    $rootScope.selected_cab = $rootScope.cabs[index];

  };

  $rootScope.disableTapTo = function () {
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function () {
      document.getElementById('autocompleteto').blur();
    });
  };

  $rootScope.disableTapFrom = function () {
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function () {
      document.getElementById('autocompletefrom').blur();
    });
  }
});

App.service('serv', function ($rootScope) {

  this.set_trip_tab = function () {

    $rootScope.myTrip_menu_selected = 0;

  };


});
function cancelTrip() {
  var scope = angular.element(
    document.getElementById("landingContent")).scope();
  scope.$apply(function () {
    scope.cancelTrip();
  });
}


