// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])
/* //if use wakanda platform
 angular.module('starter', ['ionic', 'starter.controllers','wakanda'])
 */
  .run(function ($ionicPlatform, $rootScope, $location, $ionicScrollDelegate, $ionicPopup, $http, $state, $ionicHistory, $timeout) {
    /*************** forget password ****************/

    $rootScope.forget_password = function () {
      $ionicPopup.show({
        template: 'Enter your email address below.<label class="item item-input" style="  height: 34px; margin-top: 10px;"><input  type="email"  /></label>',
        title: 'Forget Password',
        subTitle: ' ',
        scope: $rootScope,
        buttons: [
          {
            text: 'Send',
            type: 'button-clear dark-blue'
          },
          {
            text: 'Cancel',
            type: 'button-clear main-bg-color'
          },]
      });
    };

    /*************** increment-decrement function ****************/
    $rootScope.valueAdults = 1;
    $rootScope.increment_val = function (type) {
      if (type == 'Adults' && $rootScope.valueAdults >= 0 && $rootScope.valueAdults < 90) $rootScope.valueAdults++;
    };
    $rootScope.decrement_val = function (type) {
      if (type == 'Adults' && $rootScope.valueAdults > 0) $rootScope.valueAdults--;
    };

    $rootScope.confirmMsg = function (index) {
      $rootScope.show_msg = index
    }

    $rootScope.scrollTop = function () {
      $ionicScrollDelegate.scrollTop();
    };
    /*************** location function ****************/
    $rootScope.goto = function (url) {
      $location.path(url)
    }

    /*************** active function ****************/
    $rootScope.activeIcon = 1
    $rootScope.activeTab = function (index) {
      $rootScope.activeIcon = index
    }
    /*************** repeat array ****************/
    $ionicPlatform.ready(function () {
      var backbutton = 0;
      $ionicPlatform.registerBackButtonAction(function (e) {
        e.preventDefault();
        if ($ionicHistory.currentStateName() == "home") {
          if (backbutton == 0) {
            backbutton++;
            window.plugins.toast.showShortBottom('برای خروج دوباره لمس کنید');
            $timeout(function () {
              backbutton = 0;
            }, 2000);
          } else {
            navigator.app.exitApp();
          }
        } else {
          $ionicHistory.goBack();
        }
      }, 501);//registerBackButton
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        set_net('online');
      });
      $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
        set_net('offline');
      });
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      $(document).on({
        'DOMNodeInserted': function () {
          var container = $('.pac-container');
          container.attr('data-tap-disabled', 'true');
          container.click(function() {
            $('#pac-input').blur();
            $('#pac-input2').blur();
            $('#pac-input3').blur();
            $('#pac-input4').blur();
          });
        }
      }, '.pac-container')
    });
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
        $state.go("login")
      } else {
        $rootScope.userid = result;
      }
    };
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="driver"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setIsDriver(result)
      }, null);
    });
    var setIsDriver = function (result) {
      $rootScope.isDriver = (result == true || result == "true");
    };
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="wallet"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setWallet(result)
      }, null);
    });
    var setWallet = function (result) {
      $rootScope.wallet = result;
    };
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="hasTrip"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setHasTrip(result)
      }, null);
    });
    var setHasTrip = function (result) {
      $rootScope.hasTrip = (result == true || result == "true");
    };
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="isStarted"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setIsStarted(result)
      }, null);
    });
    var setIsStarted = function (result) {
      $rootScope.isStarted = (result == true || result == "true");
    };
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="uid"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setSelectedId(result)
      }, null);
    });
    var setSelectedId = function (result) {
      $rootScope.uid = result;
    };
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="myToken"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setToken(result)
      }, null);
    });
    var setToken = function (result) {
      if (result) {
        $http.defaults.headers.common.Authorization = result;
      } else {
        try {
          delete $http.defaults.headers.common.Authorization;
        } catch (e) {
        }
      }
      if ($rootScope.userid) {
        $rootScope.prepareMenu();
        $rootScope.prepareSockets();
      }
    };
    var client;
    $rootScope.prepareMenu = function () {
      if ($rootScope.isDriver) {
        if ($rootScope.hasTrip) {
          $rootScope.menu = [{id: "1", img: "img/1.png", title: "مسافران من", link: "#/app/passengers"},
            {id: "1", img: "img/2.png", title: "سفرهای من", link: "#/app/reservations"},
            {id: "2", img: "img/money.jpg", title: "گردش مالی", link: "#/app/offers"},
            {id: "5", img: "img/4.png", title: "ویرایش شماره", link: "#/app/about"},
            {id: "4", img: "img/5.png", title: "تماس با ما", link: "#/app/contact"}]
        } else {
          $rootScope.menu = [{id: "1", img: "img/1.png", title: "ثبت سفر", link: "#/app/newTrip"},
            {id: "1", img: "img/2.png", title: "سفرهای من", link: "#/app/reservations"},
            {id: "2", img: "img/money.jpg", title: "گردش مالی", link: "#/app/offers"},
            {id: "5", img: "img/4.png", title: "ویرایش شماره", link: "#/app/about"},
            {id: "4", img: "img/5.png", title: "تماس با ما", link: "#/app/contact"}]
        }
      } else {
        $rootScope.menu = [{id: "1", img: "img/1.png", title: "جست و جو", link: "#/app/search"},
          {id: "11", img: "img/2.png", title: "سفرهای من", link: "#/app/reservations"},
          {id: "12", img: "img/6.png", title: "سفر جاری", link: "#/app/acceptedTrip"},
          {id: "13", img: "img/money.jpg", title: "کیف پول", link: "#/app/wallet"},
          {id: "15", img: "img/4.png", title: "ویرایش شماره", link: "#/app/about"},
          {id: "14", img: "img/5.png", title: "تماس با ما", link: "#/app/contact"}]
      }
    }
    $rootScope.prepareSockets = function () {
      if ($rootScope.isDriver) {
        createDriver();
        client.onerror = function (event) {
          createDriver()
        };
      } else {
        createPassenger();
        client.onerror = function (event) {
          createPassenger();
        };
      }
      function createDriver() {
        client = new WebSocket("wss://uniroo.cfapps.io:4443/driverHandler");
        client.onopen = function () {
          client.send("start,1");
        };
        client.onmessage = function (msg) {
          navigator.vibrate(2000);
          cordova.plugins.notification.local.schedule({
            id: 1,
            title: 'uniroo',
            text:  " مسافر شما شد " + msg.data,
            icon: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + '/img/icon.png'
          });
        };
      }

      function createPassenger() {
        client = new WebSocket("wss://uniroo.cfapps.io:4443/userHandler");
        client.onopen = function () {
          client.send("join,2");
        };
        client.onmessage = function (msg) {
          var data = JSON.parse(msg.data);
          switch (data.command) {
            case "driverinfo":
              $rootScope.driverInfo = data.driverInfoDTO;
              $rootScope.$apply();
              break;
            case "activeTrip":
              $rootScope.driverInfo = data.driverInfoDTO;
              $rootScope.$apply();
              break;
          }
        };
      }

      $rootScope.prepareMenu();
    }
  })

  .directive('ionicRatings', function ($compile) {
    return {
      restrict: 'AE',
      replace: true,
      template: '<div class="text-right ionic_ratings">' +
      '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(1)" ng-show="rating < 1" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(1)" ng-show="rating > 0" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(2)" ng-show="rating < 2" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(2)" ng-show="rating > 1" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(3)" ng-show="rating < 3" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(3)" ng-show="rating > 2" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(4)" ng-show="rating < 4" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(4)" ng-show="rating > 3" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOff}} ionic_rating_icon_off" ng-style="iconOffColor" ng-click="ratingsClicked(5)" ng-show="rating < 5" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '<span class="icon {{iconOn}} ionic_rating_icon_on" ng-style="iconOnColor" ng-click="ratingsUnClicked(5)" ng-show="rating > 4" ng-class="{\'read_only\':(readOnly)}"></span>' +
      '</div>',
      scope: {
        ratingsObj: '=ratingsobj'
      },
      link: function (scope, element, attrs) {

        //Setting the default values, if they are not passed
        scope.iconOn = scope.ratingsObj.iconOn || 'ion-ios-star';
        scope.iconOff = scope.ratingsObj.iconOff || 'ion-ios-star-outline';
        scope.iconOnColor = scope.ratingsObj.iconOnColor || 'rgb(200, 200, 100)';
        scope.iconOffColor = scope.ratingsObj.iconOffColor || 'rgb(200, 100, 100)';
        scope.rating = scope.ratingsObj.rating || attrs.rating || 0;
        scope.minRating = scope.ratingsObj.minRating || 0;
        scope.readOnly = scope.ratingsObj.readOnly || false;
        scope.iconOnColor = {
          color: scope.iconOnColor
        };
        scope.iconOffColor = {
          color: scope.iconOffColor
        };
        scope.rating = (scope.rating > scope.minRating) ? scope.rating : scope.minRating;
        scope.prevRating = 0;
        scope.ratingsClicked = function (val) {
          if (scope.minRating !== 0 && val < scope.minRating) {
            scope.rating = scope.minRating;
          } else {
            scope.rating = val;
          }
          scope.prevRating = val;
          scope.ratingsObj.callback(scope.rating);
        };
        scope.ratingsUnClicked = function (val) {
          if (scope.minRating !== 0 && val < scope.minRating) {
            scope.rating = scope.minRating;
          } else {
            scope.rating = val;
          }
          if (scope.prevRating == val) {
            if (scope.minRating !== 0) {
              scope.rating = scope.minRating;
            } else {
              scope.rating = 0;
            }
          }
          scope.prevRating = val;
          scope.ratingsObj.callback(scope.rating);
        }
      }
    }
  })

  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.navBar.alignTitle('center');
    $ionicConfigProvider.backButton.text('').previousTitleText('');


    $stateProvider

      .state('home', {
        url: "/home",
        templateUrl: "templates/home.html",
        controller: "HomeCtrl"
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      })
      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
      })

      .state('app.search', {
        url: "/search",
        views: {
          'menuContent': {
            templateUrl: "templates/search.html",
            controller: "SearchCtrl"
          }
        }
      })

      .state('app.tripState', {
        url: "/tripState",
        views: {
          'menuContent': {
            templateUrl: "templates/tripState.html",
            controller: "tripStateCtrl"
          }
        }
      })

      .state('app.passengers', {
        url: "/passengers",
        views: {
          'menuContent': {
            templateUrl: "templates/passengers.html",
            controller: "passengersCtrl"
          }
        }
      })

      .state('app.wallet', {
        url: "/wallet",
        views: {
          'menuContent': {
            templateUrl: "templates/wallet.html",
            controller: "walletCtrl"
          }
        }
      })

      .state('app.forget-pass', {
        url: '/forget-pass',
        views: {
          'menuContent': {
            templateUrl: 'templates/forget-pass.html',
            controller: 'ForgetPassCtrl'
          }
        }
      })

      .state('app.newTrip', {
        url: "/newTrip",
        views: {
          'menuContent': {
            templateUrl: "templates/newTrip.html",
            controller: "NewTripCtrl"
          }
        }
      })

      .state('app.payment', {
        url: "/payment",
        views: {
          'menuContent': {
            templateUrl: "templates/payment.html"
          }
        }
      })

      .state('app.contact', {
        url: "/contact",
        views: {
          'menuContent': {
            templateUrl: "templates/contact.html"
          }
        }
      })

      .state('app.reservations', {
        url: "/reservations",
        views: {
          'menuContent': {
            templateUrl: "templates/reservations.html",
            controller: "ReservationsCtrl"
          }
        }
      })

      .state('app.details', {
        url: "/details",
        views: {
          'menuContent': {
            templateUrl: "templates/details.html",
            controller: "DetailsCtrl"
          }
        }
      })

      .state('app.acceptedTrip', {
        url: "/acceptedTrip",
        views: {
          'menuContent': {
            templateUrl: "templates/acceptedTrip.html",
            controller: "AcceptedTripCtrl"
          }
        }
      })

      .state('app.data', {
        url: "/data",
        views: {
          'menuContent': {
            templateUrl: "templates/data.html",
            controller: "DataCtrl"
          }
        }
      })

      .state('app.offers', {
        url: "/offers",
        views: {
          'menuContent': {
            templateUrl: "templates/offers.html",
            controller: "OffersCtrl"
          }
        }
      })

      .state('app.register', {
        url: "/register",
        views: {
          'menuContent': {
            templateUrl: "templates/register.html",
            controller: "SignupCtrl"
          }
        }
      })

      .state('app.about', {
        url: "/about",
        views: {
          'menuContent': {
            templateUrl: "templates/about.html",
            controller: "AboutCtrl"
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function ($injector, $location, $http) {
      var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS ANIJUU (name , log)');
        tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="userid"', [], function (tx, results) {
          var len = results.rows.length, i, result = '';
          if (!results.rows || results.rows.length == 0) {
            $location.path('/login');
          } else {
            $location.path('/home');
          }
        }, null);
      });
    });
  });
function set_net(status) {
  if (status == 'online') {
    $('.net-error').hide();
  } else {
    $('.net-error').show();
  }
}
