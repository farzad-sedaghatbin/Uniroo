if (wordpress == true) {
  var base_url = server_domain + '/wp-admin/admin-ajax.php';
} else {
  var base_url = server_domain + '/index.php/web_service/';
}

var user_data = null;

angular.module('CallApp', ['ionic', 'ngCordova', 'CallAppcontrollers', 'ngMockE2E'])

  .filter("langTranslate", function () {
    return function (englishInput, translatedLang) {
      if (translatedLang === undefined) {
        return englishInput;
      }
      if (translatedLang.length == 0) {
        return englishInput;
      } else {
        return translatedLang;
      }

    }
  })

  .filter("menuLangTranslate", function () {
    return function (englishInput, all_rides, completed, booked) {
      if (all_rides === undefined || completed === undefined || booked === undefined) {
        return englishInput;
      }
      if (englishInput == "تمامی پیک ها") {
        return all_rides;
      }
      if (englishInput == "پیک های انجام شده") {
        return completed;
      }
      if (englishInput == "رزرو شده") {
        return booked;
      }

    }
  })


  .filter("rateCardMenuLangTranslate", function () {
    return function (englishInput, day, night) {
      if (day === undefined || night === undefined) {
        return englishInput;
      }
      if (englishInput == "DAY") {
        return day;
      }
      if (englishInput == "NIGHT") {
        return night;
      }
    }
  })


  .run(function ($rootScope, $ionicPlatform, $ionicHistory, $state,$timeout) {
    //$cordovaSplashScreen.hide();
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      // $cordovaNativeAudio.preloadSimple('driver', 'audio/migmig.mp3');
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      var backbutton = 0;
      $ionicPlatform.registerBackButtonAction(function (e) {
        //alert($ionicHistory.currentStateName())
        if ($ionicHistory.currentStateName() == 'landing') {
          navigator.app.clearCache();
          navigator.app.exitApp();
        } else if ($ionicHistory.currentStateName() == 'app.landing') {
          if ($rootScope.numOfClick == 0) {
            if (backbutton == 0) {
              backbutton++;
              window.plugins.toast.showShortBottom('برای خروج دوباره لمس کنید');
              $timeout(function () {
                backbutton = 0;
              }, 2000);
            } else {
              navigator.app.exitApp();
            }
          } else if ($rootScope.numOfClick == 1) {
            $rootScope.$apply(function () {
              $rootScope.deleteFrom();
            });
          } else if ($rootScope.numOfClick == 2) {
            $rootScope.$apply(function () {
              $rootScope.deleteTo();
              $rootScope.pop_status = 0;
              $rootScope.enableBox = true;
              var popup = $("#my-pop");
              if (popup.hasClass("my-active")) {
                popup.toggleClass('my-active');
              }
            });
            $rootScope.initialVars();
          }
        } else if ($ionicHistory.backView()) {
          $ionicHistory.goBack();
        } else if ($ionicHistory.backTitle()) {
          $ionicHistory.goBack();
        }
        else {
          $state.go('app.landing');
          $ionicHistory.nextViewOptions({
            historyRoot: true
          });

        }
        e.preventDefault();
        return false;
      }, 122);


    });
  })
  .run(function ($ionicPopup, $rootScope, $ionicPlatform, $httpBackend, $http) {
    $httpBackend.whenGET(/.*/).passThrough();
    $httpBackend.whenPOST(/.*/).passThrough();
    var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="username"', [], function (tx, results) {
        var len = results.rows.length, i, result = '';
        if (!results.rows || results.rows.length == 0) {
          result = null;
        } else {
          result = results.rows.item(0).log;
        }
        setUsername(result)
      }, null);
    });
    var setUsername = function (result) {
      $rootScope.username = result;
    };
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
      $rootScope.userid = result;
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
        $http.defaults.headers.common.Authorization = "Bearer " + result;
      } else {
        try {
          delete $http.defaults.headers.common.Authorization;
        } catch (e) {
        }
      }
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

  // .config(function($ionicConfigProvider) {
  // if(!ionic.Platform.isIOS())$ionicConfigProvider.scrolling.jsScrolling(false);
  // })
  .config(function ($stateProvider, $urlRouterProvider, $cordovaInAppBrowserProvider, $httpProvider) {
    $httpProvider.interceptors.push('authHttpResponseInterceptor');
    setTimeout(function () {
      navigator.splashscreen.hide();
    }, 3000);
    var browserOptions = {
      location: "yes",
      toolbar: "yes"
    };
    $cordovaInAppBrowserProvider.setDefaultOptions(browserOptions);

    /* NETWORK + PAGE DIRECTION
     ===================================================	*/
    $stateProvider
      .state('landing', {
        url: '/landing',
        templateUrl: 'templates/landing.html',
        controller: 'AppCtrl'
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.landing', {
        url: '/landing',
        views: {
          'menuContent': {
            templateUrl: 'templates/main-landing.html',
            controller: 'landCtrl'
          }
        }
      })

      .state('app.mytrip', {
        url: '/mytrip',
        views: {
          'menuContent': {
            templateUrl: 'templates/my-trip.html',
            controller: 'myTripCtrl'
          }
        }
      })

      .state('app.tripDetials', {
        url: '/tripDetials',
        views: {
          'menuContent': {
            templateUrl: 'templates/trip-details.html',
            controller: 'myTripCtrl'
          }
        }
      })

      .state('app.navigation', {
        url: '/navigation',
        views: {
          'menuContent': {
            templateUrl: 'templates/navigation.html',
            controller: 'navigationCtrl'
          }
        }
      })
      .state('app.rateCard', {
        url: '/rateCard',
        views: {
          'menuContent': {
            templateUrl: 'templates/rate-card.html',
            controller: 'rateCardCtrl'
          }
        }
      })

      .state('app.settings', {
        url: '/settings',
        views: {
          'menuContent': {
            templateUrl: 'templates/settings.html',
            controller: 'settingsCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function ($injector, $location, $http) {
      var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS ANIJUU (name , log)');
        tx.executeSql('SELECT d.log FROM ANIJUU d WHERE d.name="username"', [], function (tx, results) {
          var len = results.rows.length, i, result = '';
          if (!results.rows || results.rows.length == 0) {
            result = null;
          } else {
            result = results.rows.item(0).log;
          }
          if (!result) {
            $location.path('landing');
          }
          else {
            $location.path('app/landing');
          }
        }, null);
      });
    });
  });





