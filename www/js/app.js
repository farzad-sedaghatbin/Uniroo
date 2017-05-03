// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])
/* //if use wakanda platform
    angular.module('starter', ['ionic', 'starter.controllers','wakanda'])
*/
.run(function($ionicPlatform,$rootScope,$location,$ionicScrollDelegate,$ionicPopup) {

/*************** forget password ****************/

     $rootScope.forget_password=function (){
        $ionicPopup.show({
        template: 'Enter your email address below.<label class="item item-input" style="  height: 34px; margin-top: 10px;"><input  type="email"  /></label>',
        title: 'Forget Password',
        subTitle: ' ',
        scope: $rootScope,
        buttons: [
        {text: 'Send',
        type: 'button-clear dark-blue'},
        { text: 'Cancel' ,
        type: 'button-clear main-bg-color'},]
        });
    };

/*************** increment-decrement function ****************/
$rootScope.valueKids=1;
 $rootScope.valueAdults=1;
 $rootScope.valueBabies=1;
  $rootScope.increment_val= function(type) {
    if (type=='Kids'&&$rootScope.valueKids >= 0) $rootScope.valueKids++;
    if (type=='Adults'&&$rootScope.valueAdults >= 0) $rootScope.valueAdults++;
    if (type=='Babies'&&$rootScope.valueBabies >= 0) $rootScope.valueBabies++;
  };
  $rootScope.decrement_val = function(type) {
    //if ($rootScope.value > 0)  $rootScope.value--;
    if (type=='Kids'&&$rootScope.valueKids > 0) $rootScope.valueKids--;
    if (type=='Adults'&&$rootScope.valueAdults > 0) $rootScope.valueAdults--;
    if (type=='Babies'&&$rootScope.valueBabies > 0) $rootScope.valueBabies--;

  };

$rootScope.confirmMsg=function(index){
    $rootScope.show_msg=index
}

 $rootScope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };
 /*************** group function ****************/
 $rootScope.groups = [
    {id: 1, items: [{ subName: 'SubBubbles1'}]},

    {id: 2, items: [{ subName: 'SubBubbles1'}]},

    {id: 3, items: [{ subName: 'SubBubbles1'}]},

    {id: 4, items: [{ subName: 'SubBubbles1'}]},

    {id: 5, items: [{ subName: 'SubBubbles1'}]},

    {id: 6, items: [{ subName: 'SubBubbles1'}]},

    {id: 7, items: [{ subName: 'SubBubbles1'}]}
  ];


    /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $rootScope.toggleGroup = function(group) {
    if ($rootScope.isGroupShown(group)) {
      $rootScope.shownGroup = null;
    } else {
      $rootScope.shownGroup = group;
    }
  };
  $rootScope.isGroupShown = function(group) {
    return $rootScope.shownGroup === group;
  };

/*************** location function ****************/
  $rootScope.goto=function(url){
      $location.path(url)
  }

/*************** active function ****************/
$rootScope.activeIcon=1
 $rootScope.activeTab=function(index){
      $rootScope.activeIcon=index
  }
/*************** repeat array ****************/
        $rootScope.menu =[{id:"1",img:"img/1.png",title:"جست و جو",link:"#/app/search"},
                        {id:"2",img:"img/2.png",title:"سفرهای من",link:"#/app/reservations"},
                        {id:"3",img:"img/3.png",title:"پیشنهاد ها",link:"#/app/offer"},
                        {id:"4",img:"img/4.png",title:"ثبت نام",link:"#/app/register"},
                        {id:"5",img:"img/5.png",title:"تماس با ما",link:"#/app/contact"},
                        {id:"6",img:"img/6.png",title:"درباره ما",link:"#/app/about"}]

        $rootScope.det =[{id:"1"},
                        {id:"2"}]

    $rootScope.data =[{id:"1"},
                        {id:"2"},{id:"3"},{id:"4"},{id:"5"}]

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.backButton.text('').previousTitleText('');


  $stateProvider

   .state('home', {
    url: "/home",
        templateUrl: "templates/home.html"
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
        templateUrl: "templates/search.html"
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
        templateUrl: "templates/reservations.html"
      }
    }
  })

  .state('app.details', {
    url: "/details",
    views: {
      'menuContent': {
        templateUrl: "templates/details.html"
      }
    }
  })

  .state('app.data', {
    url: "/data",
    views: {
      'menuContent': {
        templateUrl: "templates/data.html"
      }
    }
  })

  .state('app.offer', {
    url: "/offer",
    views: {
      'menuContent': {
        templateUrl: "templates/offer.html"
      }
    }
  })

  .state('app.register', {
    url: "/register",
    views: {
      'menuContent': {
        templateUrl: "templates/register.html"
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
  $urlRouterProvider.otherwise('/home');
});
