angular.module('starter.controllers', [])

  .controller('loginCtrl', function ($scope, $rootScope, $ionicModal, $timeout, $state, $ionicLoading, $ionicPopup, $http, $ionicHistory, WebService) {
    $scope.closeLogin = function () {
      $scope.mainModal.hide();
    };
    $scope.closeSignUp = function () {
      $scope.mainModal.hide();
    };


    // Open the login modal
    $scope.show_login1 = function () {
      $ionicModal.fromTemplateUrl('templates/login-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $rootScope.mainModal = modal;
        $rootScope.mainModal.show();
      });
    };

    $scope.sign_up = function () {
      $state.go("app.register")
    };


    // Perform the login action when the user submits the login form
    $scope.doLogin = function (form) {
      WebService.startLoading();
      //$state.go('view', {movieid: 1});
      // $state.go('app.landing');
      if (form.$valid) {
        try {
          delete $http.defaults.headers.common.Authorization;
        } catch (e) {
        }
        var url = "http://uniroo.cfapps.io/api/1/user_authenticate";
        var data = {
          username: $("#mail").val(),
          password: $("#pwd").val(),
          rememberMe: false
        };
        $http.post(url, data).success(function (data, status, headers, config) {
          WebService.stopLoading();
          $rootScope.userid = data.userid;
          $rootScope.isDriver = data.driver;
          $http.defaults.headers.common.Authorization = "Bearer " + data.token;
          var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
          db.transaction(function (tx) {
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["userid", data.userid]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["driver", data.driver]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["myToken", "Bearer " + data.token]);
          });
          $rootScope.prepareSocketsAndMenu();
          $state.go('app.search', {}, {reload: true});
        }).catch(function (err) {
          WebService.stopLoading();
          WebService.myErrorHandler(err, true);
        });
      } else {
        form.mail.$setDirty();
        form.pwd.$setDirty();
      }

    };

    $scope.signUp = {};
  })

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })
  .controller('SignupCtrl', function ($scope, $ionicModal, $timeout, $ionicPopup, $rootScope, $state, $http, WebService) {
    $timeout(function () {
      $(".buttons-right").css("display", "none");
      $(".back-button").css("display", "block");
    }, 0);
    $scope.isPassengerParam = true;
    $scope.isPassenger = function (isPass) {
      $scope.isPassengerParam = isPass;
      $scope.driverItems = [];
    };
    $scope.chose = function (type) {
      $scope.type = type;
      $ionicModal.fromTemplateUrl('templates/select.html', {
        scope: $scope
      }).then(function (modal) {
        $rootScope.mainModal = modal;
        $rootScope.mainModal.show();
      });
    };
    function setVariable(result) {
      if ($scope.type == 'STUDENT') {
        $scope.student = result;
      } else if ($scope.type == 'DRIVER') {
        $scope.driver = result;
      } else if ($scope.type == 'LICENSE') {
        $scope.license = result;
      } else if ($scope.type == 'CAR') {
        $scope.car = result;
      } else {
        $scope.insurance = result;
      }
    }

    $scope.remove = function (item) {
      if ($scope.type == 'STUDENT') {
        $scope.student = null;
      } else if (item.type == 'DRIVER') {
        $scope.driver = null;
      } else if (item.type == 'LICENSE') {
        $scope.license = null;
      } else if (item.type == 'CAR') {
        $scope.car = null;
      } else {
        $scope.insurance = null;
      }
      $.each($scope.driverItems, function (index, value) {
        if (value.thumbnail == item.thumbnail) {
          $scope.driverItems.splice(index, 1);
        }
      });
    };
    $scope.driverItems = [];
    $scope.gallery = function () {
      var options = {sourceType: Camera.PictureSourceType.PHOTOLIBRARY};
      navigator.camera.getPicture(function cameraSuccess(imageUri) {
        window.resolveLocalFileSystemURL(imageUri, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {
              //todo: farzad breakpoint
              setVariable(evt.target.result);
              $scope.driverItems.push({
                thumbnail: imageUri,
                type: $scope.type
              });
              $scope.$apply();
            };
            reader.readAsDataURL(file);
          });
        });
      }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");
      }, options);
    };
    $scope.camera = function () {
      var options = {sourceType: Camera.PictureSourceType.CAMERA};
      navigator.camera.getPicture(function cameraSuccess(imageUri) {
        window.resolveLocalFileSystemURL(imageUri, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {
              setVariable(evt.target.result);
              $scope.driverItems.push({
                thumbnail: imageUri,
                type: $scope.type
              });
              $scope.$apply();
            };
            reader.readAsDataURL(file);
          });
        });
      }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");
      }, options);
    };
    $scope.do_signUp = function (form) {
      var data;
      if (!$scope.isPassengerParam) {
        // if (!$scope.driver) {
        //   $ionicPopup.alert({
        //     title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
        //     template: '<p class="text-center color-gery">' + "عکس راننده انتخاب نشده است" + '</p>'
        //   });
        // } else if (!$scope.license) {
        //   $ionicPopup.alert({
        //     title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
        //     template: '<p class="text-center color-gery">' + "عکس گواهینامه انتخاب نشده است" + '</p>'
        //   });
        // } else if (!$scope.car) {
        //   $ionicPopup.alert({
        //     title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
        //     template: '<p class="text-center color-gery">' + "عکس کارت ماشین انتخاب نشده است" + '</p>'
        //   });
        // } else if (!$scope.insurance) {
        //   $ionicPopup.alert({
        //     title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
        //     template: '<p class="text-center color-gery">' + "عکس بیمه نامه انتخاب نشده است" + '</p>'
        //   });
        // }
        data = {
          firstName: $("#name").val(),
          lastName: $("#family").val(),
          username: $("#username").val(),
          mobile: $("#tel").val(),
          password: $("#pass").val(),
          isDriver: !$scope.isPassengerParam,
          gender: $("#gender").val() == "1",
          driver: $scope.driver,
          license: $scope.license,
          car: $scope.car,
          insurance: $scope.insurance
        };
      } else {
        if (!$scope.student) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "عکس کارت دانشجویی انتخاب نشده است" + '</p>'
          });
        }
        data = {
          firstName: $("#name").val(),
          lastName: $("#family").val(),
          username: $("#username").val(),
          mobile: $("#tel").val(),
          password: $("#pass").val(),
          isDriver: !$scope.isPassengerParam,
          gender: $("#gender").val() == "1",
          license: $scope.student
        };
      }
      WebService.startLoading();
      var url = "http://uniroo.cfapps.io/api/1/signup";
      $http.post(url, data)
        .success(function (suc) {
          WebService.stopLoading();
          $state.go("app.search");
        }).error(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
      });
    };

  })
  .controller('SearchCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $state, WebService, $http) {
    $scope.search = function () {
      WebService.startLoading();
      var url = "http://uniroo.cfapps.io/api/1/searchForDriver";
      var data = {
        source: $("#from").val(),
        destination: $("#to").val(),
        day: $("#year").val() + "/" + $("month").val() + "/" + $("#day").val()
      };
      $http.post(url, data).success(function (data, status, headers, config) {
        $rootScope.data = data;
        $state.go("app.data");
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, true);
      });
    }
  })

  .controller('DataCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $state) {
    $rootScope.selectedId;
    $scope.totalCost = 0;
    $scope.doSelect = function (item) {
      if ($rootScope.selectedId) {
        $('#' + $rootScope.selectedId).prop('checked', false);
      }
      $rootScope.selectedId = item.uid;
      $scope.totalCost = item.cost;
    };
  })

  .controller('DetailsCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {
    $scope.showFooter = true;
    $timeout(function () {
      WebService.startLoading();
      var url = "http://uniroo.cfapps.io/api/1/detail";
      $http.post(url, $rootScope.selectedId).success(function (data, status, headers, config) {
        $scope.detail = data;
        $scope.showDetail = true;
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, true);
      });
    }, 700);
    $scope.request = function () {
      var url = "http://uniroo.cfapps.io/api/1/Request";
      $http.post(url, $rootScope.selectedId).success(function (data, status, headers, config) {
        $scope.showFooter = false;
      }).catch(function (err) {
        WebService.myErrorHandler(err, true);
      });
    }
  })

  .controller('OffersCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $state) {
    var selectedIds = [];
    $scope.totalAmount = 0;
    $scope.$on('$stateChangeStart', function () {
      $('input[type=checkbox]').each(function () {
        $(this).prop('checked', false);
      });
      selectedIds = [];
    });
    $scope.doSelect = function (item) {
      var index = $.inArray(selectedIds, item.uid);
      if (index != -1) {
        selectedIds.push(item.uid);
        $scope.totalAmount += item.cost;
      } else {
        selectedIds.splice(index,1);
        $scope.totalAmount -= item.cost;
      }
    };
    $scope.accept = function(){

    }
  })

  .controller('AcceptedTripCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {

  })

  .controller('NewTripCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {

  })

  .controller('ReservationsCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {
    $timeout(function () {
      alert("SDfsf")
    }, 100)
  })

  .controller('HomeCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $state,$http) {
    $timeout(function () {
      document.getElementById('fab-rate').classList.toggle('on');
    }, 600);
    $scope.logout = function(){
      var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
      db.transaction(function (tx) {
        tx.executeSql('DELETE FROM ANIJUU');
      });
      $rootScope.userid = null;
      $rootScope.isDriver = null;
      try {
        delete $http.defaults.headers.common.Authorization;
      } catch (e) {
      }
      $state.go("login")
    }
  })

  .controller('PlaylistCtrl', function ($scope, $stateParams) {
  });

function limitSize(e, id, size) {
  var keys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];
  if ($.inArray(e.keyCode, keys) == -1) {
    if ($("#" + id).val().length >= size) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}
