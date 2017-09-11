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
    $scope.forget = function () {
      $state.go("forget-pass")
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
        var url = "https://uniroo.cfapps.io/api/1/user_authenticate";
        var data = {
          username: $("#mail").val(),
          password: $("#pwd").val(),
          rememberMe: true
        };
        $http.post(url, data).success(function (data, status, headers, config) {
          WebService.stopLoading();
          $rootScope.userid = data.userid;
          $rootScope.isDriver = data.driver;
          $rootScope.hasTrip = data.hasTrip;
          $rootScope.isStarted = data.isStarted;
          $rootScope.wallet = data.wallet;
          $rootScope.uid = data.UID;
          $http.defaults.headers.common.Authorization = "Bearer " + data.token;
          var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
          db.transaction(function (tx) {
            tx.executeSql('DELETE FROM ANIJUU');
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["userid", data.userid]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["driver", data.driver]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["hasTrip", data.hasTrip]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["isStarted", data.isStarted]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["wallet", data.wallet]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["uid", data.UID]);
            tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["myToken", "Bearer " + data.token]);
          });
          $rootScope.prepareMenu();
          $rootScope.prepareSockets();
          $state.go('home', {}, {reload: true});
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
          insurance: $scope.insurance,
          code : $("#code").val()
        };
        if (!data.firstName) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام اجباریست" + '</p>'
          });
          return;
        }
        if (!data.lastName) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام خانوادگی اجباریست" + '</p>'
          });
          return;
        }
        if (!data.username) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام کاربری اجباریست" + '</p>'
          });
          return;
        }
        if (!data.mobile) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "شماره موبایل اجباریست" + '</p>'
          });
          return;
        }
        if (!data.password) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "رمز عبور اجباریست" + '</p>'
          });
          return;
        }
        if (!data.number) {
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
        if (!data.firstName) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام اجباریست" + '</p>'
          });
          return;
        }
        if (!data.lastName) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام خانوادگی اجباریست" + '</p>'
          });
          return;
        }
        if (!data.username) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "نام کاربری اجباریست" + '</p>'
          });
          return;
        }
        if (!data.mobile) {
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
            template: '<p class="text-center color-gery">' + "شماره موبایل اجباریست" + '</p>'
          });
          return;
        }
        if (!data.password) {
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
      var url = "https://uniroo.cfapps.io/api/1/signup";
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
    var input;
    var input2;
    var autocomplete;
    var autocomplete2;
    function init() {
      $('.pac-container').remove();
      input = document.getElementById('pac-input');
      input2 = document.getElementById('pac-input2');
      var options = {
        componentRestrictions: {country: "ir"}
      };
      autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete2 = new google.maps.places.Autocomplete(input2, options);
    }
    $scope.$on("$ionicView.enter", function (scopes, states) {
      WebService.startLoading();
      try {
        if (typeof google === 'object' && typeof google.maps === 'object') {
          init();
          WebService.stopLoading();
        } else {
          $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAUh1zYu9a6v0k0gRob7Sy6oV_vcsu0SfY&libraries=places&sensor=false&language=en-us", function (data, textStatus, jqxhr) {
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.data = data;
            $("head").append(s);
            init();
            WebService.stopLoading();
          });
        }
      } catch (e) {
        window.plugins.toast.showShortBottom('لطفا اتصال اینترنت خود را بررسی کنید');
      }
    });
    $scope.clearSearch = function () {
      $("#pac-input").val("");
    };
    $scope.clearSearch2 = function () {
      $("#pac-input2").val("");
    };
    $scope.search = function () {
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/searchForDriver";
      var year = $("#year").val();
      var month = $("#month").val();
      var day = $("#day").val();
      var data = {
        sourceProvince: null,
        destinationProvince: null,
        day: (!year || !month || !day) ? null : year + "/" + month + "/" + day,
        type: $("#gender").val()
      };
      if (autocomplete.getPlace())
        autocomplete.getPlace().address_components.forEach(function (value, key) {
          if (value.long_name.indexOf("Province") >= 0) {
            data.sourceProvince = value.long_name.substring(0, value.long_name.lastIndexOf(" "))
          }
        });
      if (autocomplete2.getPlace())
        autocomplete2.getPlace().address_components.forEach(function (value, key) {
          if (value.long_name.indexOf("Province") >= 0) {
            data.destinationProvince = value.long_name.substring(0, value.long_name.lastIndexOf(" "))
          }
        });
      $http.post(url, data).success(function (data, status, headers, config) {
        if (!data || data.length == 0){
          window.plugins.toast.showShortBottom("نتیجه ای یافت نشد");
          WebService.stopLoading();
        } else {
          $rootScope.data = data;
          $state.go("app.data");
        }
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
      });
    }
  })

  .controller('DataCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $state) {
    $rootScope.selectedId;
    $scope.totalCost = 0;
    var selected = false;
    $scope.doSelect = function (item) {
      if (selected) {
        $('#' + $rootScope.selectedId).prop('checked', false);
        if ($rootScope.selectedId != item.uid){
          selected = true;
          $rootScope.selectedId = item.uid;
          $scope.totalCost = item.cost;
          $('#' + $rootScope.selectedId).prop('checked', true);
        } else {
          $rootScope.selectedId = null;
          selected = false;
          $scope.totalCost = 0;
        }
      } else {
        selected = true;
        $('#' + $rootScope.selectedId).prop('checked', true);
        $rootScope.selectedId = item.uid;
        $scope.totalCost = item.cost;
      }
    };
  })

  .controller('DetailsCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http, $state) {
    $scope.showFooter = true;
    $scope.$on("$ionicView.enter", function (scopes, states) {
      $timeout(function () {
        WebService.startLoading();
        var url = "https://uniroo.cfapps.io/api/1/detail";
        $http.post(url, $rootScope.selectedId).success(function (data, status, headers, config) {
          $scope.detail = data;
          $scope.showDetail = true;
          WebService.stopLoading();
        }).catch(function (err) {
          WebService.stopLoading();
          WebService.myErrorHandler(err, false);
        });
      }, 700)
    });
    $scope.request = function () {
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/Request";
      $http.post(url, $rootScope.selectedId).success(function (data, status, headers, config) {
        $.each($rootScope.data, function (index, value) {
          if (value.uid == $rootScope.selectedId) {
            $rootScope.data.splice(index, 1);
          }
        });
        $rootScope.uid = $rootScope.selectedId;
        var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
        db.transaction(function (tx) {
          tx.executeSql('DELETE FROM ANIJUU WHERE name="uid"');
          tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["uid", $rootScope.uid]);
        });
        $state.go("home");
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
      });
    }
  })

  .controller('OffersCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $http, WebService) {
    $scope.showFooter = false;
    $timeout(function () {
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/turnover";
      $http.post(url).success(function (data, status, headers, config) {
        $scope.trips = data;
        $scope.showFooter = true;
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
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

  .controller('passengersCtrl', function ($scope, $ionicModal, $timeout, $rootScope, $http, WebService) {
    $timeout(function () {
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/traveler";
      $http.post(url, $rootScope.uid).success(function (data, status, headers, config) {
        $scope.data = data;
        $scope.showDetail = true;
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
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

  .controller('AcceptedTripCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http,$state,$ionicPopup) {
    $scope.$on("$ionicView.enter", function (scopes, states) {
      $timeout(function () {
        if ($rootScope.uid) {
          WebService.startLoading();
          var url = "https://uniroo.cfapps.io/api/1/detail";
          $http.post(url, $rootScope.uid).success(function (data, status, headers, config) {
            $scope.driverInfo = data;
            $rootScope.wallet = data.wallet;
            $scope.showDetail = true;
            WebService.stopLoading();
          }).catch(function (err) {
            WebService.stopLoading();
            WebService.myErrorHandler(err);
          });
        }
      }, 700);
    });
    var rate;
    $scope.ratingsObject = {
      iconOn: 'ion-ios-star',
      iconOff: 'ion-ios-star-outline',
      iconOnColor: 'rgb(200, 200, 100)',
      iconOffColor: 'rgb(200, 100, 100)',
      rating: 0,
      minRating: 0,
      readOnly: false,
      callback: function (rating) {
        rate = rating;
      }
    };
    $scope.submitRate = function () {
      if (!rate){
        return;
      }
      var url = "https://uniroo.cfapps.io/api/1/rating";
      $http.post(url,$rootScope.uid + "," + rate).success(function (data, status, headers, config) {
        window.plugins.toast.showShortBottom("امتیاز شما به راننده با موفقیت ثبت شد");
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
      });
    };
    $scope.payment = function () {
      if (parseInt($rootScope.wallet) < $scope.driverInfo.cost){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "خطا" + '</p>',
          template: '<p class="text-center color-gery">' + "لطفا کیف پول خود را شارژ کنید، مقدار آن کمتر از هزینه سفر است" + '</p>'
        });
        return;
      }
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/tripPayment";
      $http.post(url, $rootScope.uid).success(function (data, status, headers, config) {
        WebService.stopLoading();
        window.plugins.toast.showShortBottom("پرداخت با موفقیت انجام شد");
        $state.go("home");
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err);
      });
    }
  })

  .controller('NewTripCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http, $ionicPopup,$state) {
    var options = {
      componentRestrictions: {country: "ir"}
    };
    var autocomplete3;
    var autocomplete4;
    var date;
    var jalali;
    function init() {
      $('.pac-container').remove();
      var input3 = document.getElementById('pac-input3');
      var input4 = document.getElementById('pac-input4');
      autocomplete3 = new google.maps.places.Autocomplete(input3, options);
      autocomplete4 = new google.maps.places.Autocomplete(input4, options);
      date = new Date();
      jalali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      $("#year").val(jalali.jy);
      $("#month").val(jalali.jm);
      $("#day").val(jalali.jd);
    }
    $scope.$on("$ionicView.enter", function (scopes, states) {
      WebService.startLoading();
      try {
        if (typeof google === 'object' && typeof google.maps === 'object') {
          init();
          WebService.stopLoading();
        } else {
          $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAUh1zYu9a6v0k0gRob7Sy6oV_vcsu0SfY&libraries=places&sensor=false&language=en-us", function (data, textStatus, jqxhr) {
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.data = data;
            $("head").append(s);
            init();
            WebService.stopLoading();
          });
        }
      } catch (e) {
        window.plugins.toast.showShortBottom('لطفا اتصال اینترنت خود را بررسی کنید');
      }
    });
    $scope.clearSearch = function () {
      $("#pac-input3").val("");
    };
    $scope.clearSearch2 = function () {
      $("#pac-input4").val("");
    };
    $scope.submit = function () {
      var url = "https://uniroo.cfapps.io/api/1/submitTrip";
      var hour = $("#hour").val();
      var minute = $("#minute").val();
      var year = $("#year").val();
      var month = $("#month").val();
      var day = $("#day").val();
      var sourceProvince;
      var destinationProvince;
      var data = {
        source: $("#pac-input3").val(),
        destination: $("#pac-input4").val(),
        date: year + "/" + month + "/" + day,
        time: hour + ":" + minute,
        cost: $("#cost").val(),
        capacity: $("#num").val(),
        type: $("#gender").val(),
        sourceProvince: null,
        destinationProvince: null
      };
      if (!data.source) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "مبدا سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!data.destination) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "مقصد سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!year || !month || !day) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "تاریخ سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!hour || !minute) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "ساعت سفر اجباریست" + '</p>'
        });
        return;
      }
      if (!data.cost) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "هزینه سفر اجباریست" + '</p>'
        });
        return;
      }
      if (data.cost < 30000) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "حداقل هزینه سفر 30000 ریال می باشد" + '</p>'
        });
        return;
      }
      if (!data.capacity) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "ظرفیت اجباریست" + '</p>'
        });
        return;
      }
      if (!data.type) {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "جنسیت مسافر اجباریست" + '</p>'
        });
        return;
      }
      if (!validateHour(hour)){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "ساعت سفر اشتباه می باشد" + '</p>'
        });
        return;
      }
      if (!validateMin(minute)){
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "دقیقه سفر اشتباه می باشد" + '</p>'
        });
        return;
      }
      if (autocomplete3.getPlace()) {
        autocomplete3.getPlace().address_components.forEach(function (value, key) {
          if (value.long_name.indexOf("Province") >= 0) {
            data.sourceProvince = value.long_name.substring(0, value.long_name.lastIndexOf(" "))
          }
        });
      } else {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "برای مبدا، لطفا یکی از مکانهای پیشنهادی را انتخاب کنید" + '</p>'
        });
        return;
      }
      if (autocomplete4.getPlace()) {
        autocomplete4.getPlace().address_components.forEach(function (value, key) {
          if (value.long_name.indexOf("Province") >= 0) {
            data.destinationProvince = value.long_name.substring(0, value.long_name.lastIndexOf(" "))
          }
        });
      } else {
        $ionicPopup.alert({
          title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
          template: '<p class="text-center color-gery">' + "برای مقصد، لطفا یکی از مکانهای پیشنهادی را انتخاب کنید" + '</p>'
        });
        return;
      }
      WebService.startLoading();
      $http.post(url, data).success(function (data, status, headers, config) {
        $rootScope.uid = data;
        $rootScope.hasTrip = true;
        $rootScope.isStarted = false;
        $("#tripstate").css("background", "#4ec1f8");
        var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
        db.transaction(function (tx) {
          tx.executeSql('DELETE FROM ANIJUU WHERE name="uid"');
          tx.executeSql('DELETE FROM ANIJUU WHERE name="hasTrip"');
          tx.executeSql('DELETE FROM ANIJUU WHERE name="isStarted"');
          tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["uid", data]);
          tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["hasTrip", true]);
          tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["isStarted", false]);
        });
        window.plugins.toast.showShortBottom('سفر شما با موفقیت ثبت شد');
        $rootScope.prepareMenu();
        $state.go("home");
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
      });
    }
  })

  .controller('ReservationsCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $http) {
    $timeout(function () {
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/trips";
      $http.post(url).success(function (data, status, headers, config) {
        $scope.trips = data;
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err, false);
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

  .controller('ForgetPassCtrl', function ($scope, $ionicPopup, $http, $rootScope, $state, WebService) {
    delete $http.defaults.headers.common.Authorization;
    $scope.$on('$ionicView.beforeEnter', function (e, viewData) {
      $scope.$root.showMenuIcon = false;
      viewData.enableBack = true;
      $(".buttons-right").css("display","none");
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
            $state.go('menuless.login', {}, {
              "type": "slide",
              "direction": "right",
              "duration": 500
            });
          } else if (suc == "301") {
            $ionicPopup.alert({
              title: '<span class="myText">پیام</span>',
              template: '<div class="myText" style="text-align: right;direction: rtl">خطا در عملیات. لطفا مجددا تلاش کنید</div>'
            });
            $state.go('menuless.login', {}, {
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

  .controller('HomeCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $state, $http, $ionicSlideBoxDelegate) {
    var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
    $scope.myMneu = [];
    $scope.start = function () {
      if (!$rootScope.hasTrip)
        return;
      WebService.startLoading();
      if (!$rootScope.isStarted) {
        var url = "https://uniroo.cfapps.io/api/1/startTrip";
        $http.post(url, $rootScope.uid).success(function (data, status, headers, config) {
          db.transaction(function (tx) {
            tx.executeSql('UPDATE ANIJUU SET log="false" WHERE d.name="isStarted"');
          });
          $("#tripstate").html('پایان سفر');
          $rootScope.isStarted = true;
          WebService.stopLoading();
        }).catch(function (err) {
          WebService.stopLoading();
          WebService.myErrorHandler(err);
        });
      } else {
        var url = "https://uniroo.cfapps.io/api/1/endOfTrip";
        $http.post(url, $rootScope.uid).success(function (data, status, headers, config) {
          db.transaction(function (tx) {
            tx.executeSql('UPDATE ANIJUU SET log=FALSE WHERE d.name="hasTrip"');
            tx.executeSql('UPDATE ANIJUU SET log=FALSE WHERE d.name="isStarted"');
          });
          $rootScope.hasTrip = false;
          $rootScope.isStarted = false;
          $("#tripstate").html('آغاز سفر');
          $("#tripstate").css("background", "lightgray");
          $rootScope.prepareMenu();
          $scope.myMneu = $rootScope.menu;
          $state.go("home");
          WebService.stopLoading();
        }).catch(function (err) {
          WebService.stopLoading();
          WebService.myErrorHandler(err);
        });
      }
    };
    $scope.slide = function (index) {
      $ionicSlideBoxDelegate.slide(index);
    };
    $scope.enableSwipe = function () {
      $ionicSlideBoxDelegate.enableSlide(true);
    };
    $scope.$on("$ionicView.enter", function (scopes, states) {
      $timeout(function () {
        if (!$rootScope.isStarted) {
          $("#tripstate").hide().html('آغاز سفر').fadeIn('fast');
        } else {
          $("#tripstate").hide().html('پایان سفر').fadeIn('fast');
        }
        if (!$rootScope.hasTrip) {
          $("#tripstate").hide().css("background", "lightgray").fadeIn('fast');
        } else {
          $("#tripstate").hide().css("background", "#4ec1f8").fadeIn('fast');
        }
        $scope.myMneu = $rootScope.menu;
        $scope.$apply();
      }, 100);
      $timeout(function () {
        $scope.myMneu = [];
        $scope.$apply();
      }, 0);
    });
    $timeout(function () {
      document.getElementById('fab-rate').classList.toggle('on');
    }, 600);
    $scope.logout = function () {
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

  .controller('walletCtrl', function ($scope, $http, WebService, $state, $timeout, $rootScope,$ionicPopup) {
    var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
    $timeout(function () {
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/wallet";
      $http.post(url).success(function (data, status, headers, config) {
        $rootScope.wallet = data;
        db.transaction(function (tx) {
          tx.executeSql('UPDATE ANIJUU SET log=? WHERE d.name="wallet"', [data]);
        });
        $scope.showDetail = true;
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err);
      });
    }, 700);
    $scope.goToSaman = function () {
      var amount = $("#cost").val();
      if (!amount)
        return;
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/factor";
      $http.post(url, amount).success(function (data, status, headers, config) {
        WebService.stopLoading();
        var f = document.getElementById('TheForm');
        f.Amount.value = amount;
        f.MID.value = "10822833";
        f.ResNum.value = data;
        f.RedirectURL.value = "https://uniroo.cfapps.io/api/1/donePeyment";
        f.submit();
        $state.go("home");
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err);
      });
    };
    $scope.code = function () {
      var code = $("#code").val();
      if (!code)
        return;
      WebService.startLoading();
      var url = "https://uniroo.cfapps.io/api/1/giftCard";
      $http.post(url,code).success(function (data, status, headers, config) {
        if (data == "-1"){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "خطا" + '</p>',
            template: '<p class="text-center color-gery">' + "کد اشتباه است" + '</p>'
          });
        } else if (data == "0"){
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "خطا" + '</p>',
            template: '<p class="text-center color-gery">' + "کد منقضی شده است" + '</p>'
          });
        } else {
          $rootScope.wallet = parseInt($rootScope.wallet) + parseInt(data);
          $ionicPopup.alert({
            title: '<p class="text-center color-yellow">' + "پیام" + '</p>',
            template: '<p class="text-center color-gery">' + "حساب شما مبلغ " + data + " ریال شارژ شد" + '</p>'
          });
        }
        WebService.stopLoading();
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err);
      });
    }
  })

  .controller('tripStateCtrl', function ($scope, $ionicModal, $timeout, $rootScope, WebService, $state, $http) {

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
function validateHour(timeStr) {
  return (timeStr >= 0 && timeStr <= 24);
}
function validateMin(timeStr) {
  return (timeStr >= 0 && timeStr <= 59);
}
