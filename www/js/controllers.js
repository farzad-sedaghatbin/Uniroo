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
        var url = "http://192.168.160.172:8080/api/1/user_authenticate";
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
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };
    $scope.login = function () {
      $scope.modal.show();
    };
    $scope.doLogin = function () {
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
        data = {
          firstName: $("#name").val(),
          lastName: $("#family").val(),
          username: $("#username").val(),
          mobile: $("#tel").val(),
          password: $("#pass").val(),
          number: $("#number").val(),
          isDriver: !$scope.isPassengerParam,
          gender: $("#gender").val() == "1",
          driver: $scope.driver,
          license: $scope.license,
          car: $scope.car,
          insurance: $scope.insurance
        };
        if (!data.firstName){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام اجباریست" + '</p>'
          });
          return;
        }
        if (!data.lastName){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام خانوادگی اجباریست" + '</p>'
          });
          return;
        }
        if (!data.username){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام کاربری اجباریست" + '</p>'
          });
          return;
        }
        if (!data.mobile){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "شماره موبایل اجباریست" + '</p>'
          });
          return;
        }
        if (!data.password){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "رمز عبور اجباریست" + '</p>'
          });
          return;
        }
        if (!data.number){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "پلاک ماشین اجباریست" + '</p>'
          });
          return;
        }
        if (!$scope.driver) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "عکس راننده انتخاب نشده است" + '</p>'
          });
          return;
        } else if (!$scope.license) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "عکس گواهینامه انتخاب نشده است" + '</p>'
          });
          return;
        } else if (!$scope.car) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "عکس کارت ماشین انتخاب نشده است" + '</p>'
          });
          return;
        } else if (!$scope.insurance) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "عکس بیمه نامه انتخاب نشده است" + '</p>'
          });
          return;
        }
      } else {
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
        if (!data.firstName){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام اجباریست" + '</p>'
          });
          return;
        }
        if (!data.lastName){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام خانوادگی اجباریست" + '</p>'
          });
          return;
        }
        if (!data.username){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام کاربری اجباریست" + '</p>'
          });
          return;
        }
        if (!data.mobile){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "شماره موبایل اجباریست" + '</p>'
          });
          return;
        }
        if (!data.password){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "رمز عبور اجباریست" + '</p>'
          });
          return;
        }
        if (!$scope.student) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "عکس کارت دانشجویی انتخاب نشده است" + '</p>'
          });
          return;
        }
      }
      WebService.startLoading();
      var url = "http://192.168.160.172:8080/api/1/signup";
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
      var url = "http://192.168.160.172:8080/api/1/searchForDriver";
      var data = {
        source: $("#from").val(),
        destination: $("#to").val(),
        day: $("#year").val() + "/" + $("#month").val() + "/" + $("#day").val()
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

  .controller('DetailsCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http,$state) {
    $scope.showFooter = true;
    $timeout(function () {
      WebService.startLoading();
      var url = "http://192.168.160.172:8080/api/1/detail";
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
      WebService.startLoading();
      var url = "http://192.168.160.172:8080/api/1/Request";
      $http.post(url, $rootScope.selectedId).success(function (data, status, headers, config) {
        $.each($rootScope.data, function (index, value) {
          if (value.uid == $rootScope.selectedId) {
            $rootScope.data.splice(index, 1);
          }
        });
        $state.go("app.data");
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, true);
      });
    }
  })

  .controller('OffersCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $http) {
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
      if (index == -1) {
        selectedIds.push(item.uid);
        $scope.totalAmount += item.cost;
      } else {
        selectedIds.splice(index,1);
        $scope.totalAmount -= item.cost;
      }
      $scope.$apply();
    };
    $scope.accept = function(){
      var url = "http://192.168.160.172:8080/api/1/approvedDriver";
      $http.post(url, selectedIds.toString()).success(function (data, status, headers, config) {
      }).catch(function (err) {
        WebService.myErrorHandler(err, true);
      });
    }
  })

  .controller('AcceptedTripCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {

  })

  .controller('NewTripCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http,$ionicPopup,$cordovaToast) {
    $scope.submit = function(){
      var url = "http://192.168.160.172:8080/api/1/submitTrip";
      var hour = $("#hour").val();
      var minute = $("#minute").val();
      var year = $("#year").val();
      var month = $("#month").val();
      var day = $("#day").val();
      var data = {
        source : $("#from").val(),
        destination : $("#to").val(),
        date : year + "/" + month + "/" + day,
        time : hour + ":" + minute,
        price : $("#cost").val(),
        capacity : $("#num").val(),
        type : $("#gender").val()
      };
      if (!data.source){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "مبدا سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!data.destination){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "مقصد سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!year || !month || !day){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "تاریخ سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!hour || !minute){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "ساعت سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!data.price){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "هزینه سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!data.capacity){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "ظرفیت اجباریست" + '</p>'
        });
        return;
      }
      if (!data.type){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "جنسیت مسافر اجباریست" + '</p>'
        });
        return;
      }
      WebService.startLoading();
      $http.post(url, data).success(function (data, status, headers, config) {
        $cordovaToast.showShortBottom('سفر شما با موفقیت ثبت شد');
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, true);
      });
    }
  })

  .controller('ReservationsCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {
    $timeout(function () {
      WebService.startLoading();
      var url;
      if ($rootScope.isDriver) {
        url = "http://192.168.160.172:8080/api/1/driverTrips";
      } else {
        url = "http://192.168.160.172:8080/api/1/clientTrips";
      }
      $http.post(url).success(function (data, status, headers, config) {
        $scope.trips = data;
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, true);
      });
    }, 700);
    $scope.toggleGroup = function (group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function (group) {
      return $scope.shownGroup === group;
    };
  })

  .controller('ForgetPassCtrl', function ($scope, $ionicPopup, $http, $rootScope, $state,WebService) {
    delete $http.defaults.headers.common.Authorization;
    $scope.$on('$ionicView.beforeEnter', function (e, viewData) {
      $scope.$root.showMenuIcon = false;
      viewData.enableBack = true;
    });
    $scope.username = "";
    $scope.password = "";
    $scope.confirmPass = "";
    $scope.submit = function (username) {
      WebService.startLoading();
      var signUpUrl = "http://app.anijuu.ir/api/1/forget";
      $http.post(signUpUrl, username)
        .success(function (suc) {
          if (suc == "201") {
            $ionicPopup.alert({
              title: '<span class="myText">خطا</span>',
              template: '<div class="myText" style="text-align: right">نام کاربری اشتباه می باشد</div>'
            });
          } else {
            $ionicPopup.alert({
              title: '<span class="myText">پیام</span>',
              template: '<div class="myText" style="text-align: right;direction: rtl">کد مورد نیاز برای تغییر کلمه عبور پیامک شد</div>'
            });
            $(".popup").css("width", "90%");
            $scope.forgetPassCodeForm = true;
          }
          WebService.stopLoading();
        })
        .error(function (err) {
          WebService.myHandleError(err);
          WebService.stopLoading();
        });
    };
    $scope.confirm = function (code, password) {
      var signUpUrl = "http://app.anijuu.ir/api/1/confirmReset";
      $http.post(signUpUrl, JSON.stringify({code: code, password: password}))
        .success(function (suc) {
          WebService.stopLoading();
          if (suc == "200") {
            $ionicPopup.alert({
              title: '<span class="myText">پیام</span>',
              template: '<div class="myText" style="text-align: right;direction: rtl">کلمه عبور با موفقیت تغییر کرد</div>'
            });
            $ionicNativeTransitions.stateGo('menuless.login', {}, {
              "type": "slide",
              "direction": "right",
              "duration": 500
            });
          } else if (suc == "301") {
            $ionicPopup.alert({
              title: '<span class="myText">پیام</span>',
              template: '<div class="myText" style="text-align: right;direction: rtl">خطا در عملیات. لطفا مجددا تلاش کنید</div>'
            });
            $ionicNativeTransitions.stateGo('menuless.login', {}, {
              "type": "slide",
              "direction": "right",
              "duration": 500
            });
          } else {
            $ionicPopup.alert({
              title: '<span class="myText">پیام</span>',
              template: '<div class="myText" style="text-align: right;direction: rtl">کد اشتباه می باشد</div>'
            });
          }
          $(".popup").css("width", "90%");
        })
        .error(function (err) {
          WebService.myHandleError(err);
          WebService.stopLoading();
        });
    };
    $scope.checkPassword = function (form, password, confirmPass) {
      var result = password !== confirmPass;
      $scope.result = result;
      form.confirmPass.$setValidity("validity", !result);
    };
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
