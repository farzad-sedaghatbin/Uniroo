// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])
  /* //if use wakanda platform
   angular.module('starter', ['ionic', 'starter.controllers','wakanda'])
   */
  .run(function ($ionicPlatform, $rootScope, $location, $ionicScrollDelegate, $ionicPopup, $http,$state) {
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
      if (!result){
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
      $rootScope.isDriver = result;
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
      if ($rootScope.userid)
        $rootScope.prepareSocketsAndMenu();
    };
    var client;
    $rootScope.prepareSocketsAndMenu = function () {
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
      function createDriver(){
        client = new WebSocket("ws://uniroo.cfapps.io/driverHandler");
        client.onopen = function () {
          client.send("start,1");
        };
        client.onmessage = function (msg) {
          var data = JSON.parse(msg.data);
          switch (data.command) {
            case "request":
              if (!$rootScope.trips)
                $rootScope.trips = [];
              $rootScope.trips.push(data.tripInfo);
              $rootScope.$apply();
              break;
            case "requests":
              $rootScope.trips = data.tripInfos;
              $rootScope.$apply();
              break;
          }
        };
      }
      function createPassenger(){
        client = new WebSocket("ws://uniroo.cfapps.io/userHandler");
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
      if ($rootScope.isDriver) {
        $rootScope.menu = [{id: "1", img: "img/1.png", title: "ثبت سفر", link: "#/app/newTrip"},
          {id: "2", img: "img/2.png", title: "سفرهای من", link: "#/app/reservations"},
          {id: "3", img: "img/3.png", title: "پیشنهاد ها", link: "#/app/offers"},
          {id: "4", img: "img/4.png", title: "ثبت نام", link: "#/app/register"},
          {id: "5", img: "img/5.png", title: "تماس با ما", link: "#/app/contact"},
          {id: "6", img: "img/6.png", title: "درباره ما", link: "#/login"}]
      } else {
        $rootScope.menu = [{id: "1", img: "img/1.png", title: "جست و جو", link: "#/app/search"},
          {id: "2", img: "img/2.png", title: "سفرهای من", link: "#/app/reservations"},
          {id: "3", img: "img/3.png", title: "سفر جاری", link: "#/app/acceptedTrip"},
          {id: "4", img: "img/4.png", title: "ثبت نام", link: "#/app/register"},
          {id: "5", img: "img/5.png", title: "تماس با ما", link: "#/app/contact"},
          {id: "6", img: "img/6.png", title: "درباره ما", link: "#/login"}]
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
        controller : "HomeCtrl"
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
            controller : "ReservationsCtrl"
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
            controller : "OffersCtrl"
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
            templateUrl: "templates/about.html"
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
