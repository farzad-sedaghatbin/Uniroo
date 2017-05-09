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
      }catch (e){
      }
      var url = "http://192.168.161.111:8080/api/1/user_authenticate";
      var data = {
        username: $scope.login.mail,
        password: $scope.login.pwd,
        rememberMe: false
      };
      $http.post(url, data).success(function (data, status, headers, config) {
        WebService.stopLoading();
        $rootScope.username = $scope.login.mail;
        $http.defaults.headers.common.Authorization = "Bearer " + data.token;
        var db = openDatabase('mydb', '1.0', 'Test DB', 1024 * 1024);
        db.transaction(function (tx) {
          tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["username", $scope.login.mail]);
          tx.executeSql('INSERT INTO ANIJUU (name, log) VALUES (?, ?)', ["myToken", "Bearer " + data.token]);
        });
        $scope.modal.sign_in.hide();
        $state.go('app.landing', {}, {reload: true});
      }).catch(function (err) {
        WebService.stopLoading();
        WebService.myErrorHandler(err,true);
      });
    } else {
      form.mail.$setDirty();
      form.pwd.$setDirty();
    }

  };

  $scope.signUp = {};
  $scope.logout = function () {
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      });
      $state.go('login', {}, {reload: true});
  };
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})
.controller('SignupCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $rootScope) {
  $timeout(function() {
    $(".buttons-right").css("display","none");
    $(".back-button").css("display","block");
  }, 0);
  $scope.isPassengerParam = true;
  $scope.isPassenger = function(isPass){
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
    if ($scope.type == 'STUDENT'){
      $scope.student = result;
    } else if ($scope.type == 'DRIVER'){
      $scope.driver = result;
    } else if ($scope.type == 'LICENSE'){
      $scope.license = result;
    } else if ($scope.type == 'CAR'){
      $scope.car = result;
    } else {
      $scope.insurance = result;
    }
  }
  $scope.remove = function (item) {
    if ($scope.type == 'STUDENT'){
      $scope.student = null;
    } else if (item.type == 'DRIVER'){
      $scope.driver = null;
    } else if (item.type == 'LICENSE'){
      $scope.license = null;
    } else if (item.type == 'CAR'){
      $scope.car = null;
    } else {
      $scope.insurance = null;
    }
    $.each($scope.driverItems, function( index, value ) {
      if (value.thumbnail == item.thumbnail){
        $scope.driverItems.splice(index,1);
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
          reader.onloadend = function(evt) {
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
          reader.onloadend = function(evt) {
            setVariable(evt.target.result);
            $scope.driverItems.push({
              thumbnail : imageUri,
              type : $scope.type
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
    $state.go("home")
    // if (!$scope.isPassengerParam) {
    //   if (!$scope.driver) {
    //     $ionicPopup.alert({
    //       title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
    //       template: '<p class="text-center color-gery">' + "عکس راننده انتخاب نشده است" + '</p>'
    //     });
    //   } else if (!$scope.license) {
    //     $ionicPopup.alert({
    //       title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
    //       template: '<p class="text-center color-gery">' + "عکس گواهینامه انتخاب نشده است" + '</p>'
    //     });
    //   } else if (!$scope.car) {
    //     $ionicPopup.alert({
    //       title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
    //       template: '<p class="text-center color-gery">' + "عکس کارت ماشین انتخاب نشده است" + '</p>'
    //     });
    //   } else if (!$scope.insurance) {
    //     $ionicPopup.alert({
    //       title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
    //       template: '<p class="text-center color-gery">' + "عکس بیمه نامه انتخاب نشده است" + '</p>'
    //     });
    //   }
    // } else {
    //   if (!$scope.student) {
    //     $ionicPopup.alert({
    //       title: '<p class="text-center color-yellow">' + "نقص در اطلاعات" + '</p>',
    //       template: '<p class="text-center color-gery">' + "عکس کارت دانشجویی انتخاب نشده است" + '</p>'
    //     });
    //   }
    // }
    // WebService.startLoading();
    // //$state.go('view', {movieid: 1});
    // if (
    //   form.$valid
    //   && $scope.signUp.pwd == $scope.signUp.c_pwd
    // //true
    // ) {
    //   var post_data = {
    //     'secret_key': secret_key,
    //     'Email': $scope.signUp.mail,
    //     'Password': $scope.signUp.pwd,
    //     'Mobile': $scope.signUp.mobile,
    //     'User_name': $scope.signUp.user_name,
    //     'Name': $scope.signUp.name,
    //   }
    //
    //   var url = "http://127.0.0.1:8080/api/1/signup";
    //   var data = {
    //     firstName: $scope.signUp.name,
    //     lastName: $scope.signUp.name,
    //     username: $scope.signUp.user_name,
    //     mobile: $scope.signUp.mobile,
    //     password: $scope.signUp.pwd
    //   };
    //   $http.post(url, data)
    //     .success(function (suc) {
    //       WebService.stopLoading();
    //       $state.go("app.landing");
    //     }).error(function (err) {
    //     WebService.stopLoading();
    //     WebService.myErrorHandler(err,false);
    //   });
    // } else {
    //   form.pwd.$setDirty();
    //   form.number.$setDirty();
    //   form.mail.$setDirty();
    //   form.name.$setDirty();
    //   form.user_name.$setDirty();
    //
    // }

  };

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
