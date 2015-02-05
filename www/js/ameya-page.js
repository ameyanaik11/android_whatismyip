var app = angular.module('StarterApp', ['ngMaterial', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ngCordova', 'ngMessages']);

/* No debugging mode */
/*
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
*/

/* For AJAX Data-binding */
app.directive('ameyahtml', ["$compile", "$parse", function ($compile, $parse) {
    return {
        restrict: 'A',
        link: function ($scope, element, attr) {
            var parse = $parse(attr.ngBindHtml);

            function value() {
                return (parse($scope) || '').toString();
            }

            $scope.$watch(value, function () {
                $compile(element, null, -9999)($scope);
            });
        }
    }
}]);

app.run(function($rootScope) {
  $rootScope.alert = null;
})
.controller('AppCtrl', ['$scope', '$mdSidenav', '$timeout', '$http', '$sce', '$log', '$mdDialog', '$mdToast', 
  '$cordovaDevice', '$cordovaNetwork',
  function($scope, $mdSidenav, $timeout, $http, $sce, $log, $mdDialog, $mdToast, $cordovaDevice, $cordovaNetwork){
    /* Global constants */
    $scope.appInfo = {
      version: '0.0.1'
    };

    $scope.feedbackForm = {
      sendTo: 'Developer of What is my IP',
      userName: 'User',
      userEmail: 'test@ameyanaik.com',
      comment: 'Testing 123'
    };

    $scope.feedbackButton = {
      submit: {
        text: 'Send feedback!',
        class: 'md-primary',
      },
      loading: {
        text: 'please wait',
        class: '',
        isLoading: true,
      },
      sent: {
        text: 'Thanks :)',
        class: 'md-success',
        no_action: true,
      },
      failed: {
        text: 'Retry sending feedback!',
        class: 'md-primary',
      }
    };

    $scope.alertRateApp = {
      error: {
        type: 'alert-warning',
        text: 'Thanks for your interest in rating our app. Unfortunately, we encountered an error. Please try again later.',
        button: {
          type: 'btn-danger',
          text: 'Rate us',
          click: 'rateAppConfirm()'
        }
      },
      thankyou: {
        type: 'alert-success',
        text: 'Thanks for rating our application. We appreciate your support. :)'
      },
      later: {
        type: 'alert-warning',
        text: 'No worries. It will be definitely help us if you rate our application later on.'
      }
    };
    $scope.alertIPDetails = {
      error: {
        type: 'alert-warning',
        text: 'Something wired happended. Please try again.',
        button: {
          type: 'btn-danger',
          text: 'Try again',
          click: 'ajaxFetch();'
        }
      },
      success: null,
      successOld: {
        type: 'alert-success',
        text: 'Cool.. You are connected to internet.'
      },
      loading: {
        type: 'alert-info',
        text: 'Please wait. We are trying to fetch details.'
      }
    };
    $scope.alertAboutUs = {
        type: 'alert-success',
        text: 'Thanks.. Have a awesome day. :)'
    };

    $scope.alert = $scope.alertIPDetails.loading;
    /* Loading */
    $scope.isLoading = true;
    $timeout(function() {
      $scope.isLoading = false;
      $scope.ajaxFetch();
    }, 1000);
  
    /* Change view */
    $scope.setView = function($viewName) {
      $scope.currentView = $viewName;
    };
    $scope.isView = function($viewName) {
      return $scope.currentView == $viewName;
    };
    $scope.setView('main');
    /* Side bar */
    $scope.sideNavigation = [
      { name: 'Refresh', action: 'refresh' },
      { name: 'Rate application', action: 'rate_app'},
      { name: 'Feedback', action: 'feedback' },
      { name: 'About Us', action: 'about_us' },
    ];
    $scope.listItemClick = function($index) {
      var clickedItem = $scope.sideNavigation[$index];
      //alert(clickedItem.name);
      //$mdBottomSheet.hide(clickedItem);
      $mdSidenav('left').close()
                        .then(function(){
                          if (clickedItem.action == 'rate_app') {
                            $scope.setView('main');
                            $scope.rateAppConfirm(clickedItem);
                          } else if (clickedItem.action == 'about_us') {
                            $scope.setView('aboutUs');
                          } else if (clickedItem.action == 'feedback') {
                            $scope.setView('comment');
                          } else if (clickedItem.action == 'refresh') {
                            $scope.setView('main');               
                            $scope.isLoading = true;
                            $timeout(function() {
                              $scope.isLoading = false;
                              $scope.ajaxFetch();
                            }, 500);
                          }
                          $log.debug("left menu action done..");
                        });
    };
    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    $scope.close = function() {
      $mdSidenav('left').close();
    };

    /* Rate application */
    $scope.rateAppConfirm = function(ev) {
      var confirm = $mdDialog.confirm()
        .title('Rate - What is my IP')
        .content('Kindly rate our application. It will definitely help us. We appreciate your support.')
        .ok('Yes :)')
        .cancel('No :(')
        .targetEvent(ev);
      $mdDialog.show(confirm).then(function() {
        var rate_us_browser = window.open('market://details?id=com.idisplay.virtualscreen', '_blank', 'location=yes');
        if (rate_us_browser != null) {
          rate_us_browser.addEventListener('exit', function(event) { 
            //alert("Thanks for your support --> " + event.url); 
            $scope.alert = $scope.alertRateApp.thankyou;
          });
        } else {
          $scope.alert = $scope.alertRateApp.error;
        }
      }, function() {
        $scope.alert = $scope.alertRateApp.later;
      });
    };

    /* Retrieve details */
    $scope.ajaxFetchGET = function() {
      $scope.alert = $scope.alertIPDetails.loading;
      $scope.data = {arg1:"Ameya", arg2:"Naik"};
      $http.get("http://www.ameyanaik.com/android/whatismyip_material/", {ameya: "naik"})
      .success(function(response) {
        //$scope.myHTML = response;
        $scope.myHTML = $sce.trustAsHtml(response);
        $scope.alert = $scope.alertIPDetails.success;
      })
      .error(function() {
        $scope.myHTML = "";
        $scope.alert = $scope.alertIPDetails.error;
      });
    }

    $scope.ajaxFetch = function() {
      $scope.alert = $scope.alertIPDetails.loading;
      var data = {
        app: 'whatismyip',
        request: 'getIP',
        device: $cordovaDevice.getDevice(),
        connection: $cordovaNetwork.getNetwork()
      };
      
      $http.post('http://www.ameyanaik.com/android/whatismyip_material/', data).success(function(response) {
        $scope.myHTML = $sce.trustAsHtml(response);
        $scope.alert = $scope.alertIPDetails.success;
      })
      .error(function() {
        $scope.myHTML = "";
        $scope.alert = $scope.alertIPDetails.error;
      });
    }

    /* About us Toast */
    $scope.showAboutUs = function() {
      var toast = $mdToast.simple()
            .content('Developed by: Ameya Naik')
            .action('OK')
            .highlightAction(true)
            .position('top right left');
      $mdToast.show(toast).then(function() {
        $scope.alert = $scope.alertAboutUs;
      });
    };

    /* Cordova - getConnection */
    $scope.connectionType = null;
    $scope.checkConnection = function() {
      var networkState = $cordovaNetwork.getNetwork();

      var states = {};
      states[Connection.UNKNOWN]  = 'Unknown connection';
      states[Connection.ETHERNET] = 'Ethernet (LAN port)';
      states[Connection.WIFI]     = 'WiFi connection';
      states[Connection.CELL_2G]  = 'Cell 2G data';
      states[Connection.CELL_3G]  = 'Cell 3G data';
      states[Connection.CELL_4G]  = 'Cell 4G data';
      states[Connection.CELL]     = 'Cell Data connection';
      states[Connection.NONE]     = 'No network connection';

      $scope.connectionType = states[networkState];
      $scope.ameyaAppConnection = states[networkState];
    }
    document.addEventListener("deviceready", function () {
      var device = $cordovaDevice.getDevice();
      var cordova = $cordovaDevice.getCordova();
      var model = $cordovaDevice.getModel();
      var platform = $cordovaDevice.getPlatform();
      var uuid = $cordovaDevice.getUUID();
      var version = $cordovaDevice.getVersion();
      //alert('Ameya Device: ' + device);
      $scope.checkConnection();
    }, false);

    /* submit feedback form */
    $scope.feedbackButton.current = $scope.feedbackButton.submit;
    $scope.submitFeedbackForm = function(feedbackParam) {
      if ($scope.feedbackButton.current.no_action) {
        $scope.feedbackButton.current = $scope.feedbackButton.submit;
        $scope.feedbackForm.userName = '';
        $scope.feedbackForm.userEmail = '';
        $scope.feedbackForm.comment = '';
        $scope.setView('main');
        return false;
      }
      var isvalid = true;
      // validation 
      /*
      if (isvalid) {
          $http.get('api/check_something', {}).then(function(result) {
              $location.path(result.data);
          });
          return true;
      }
      */
      //alert(feedback.comment);
      var postData = {
        app: 'whatismyip',
        request: 'submitFeedback',
        feedback: feedbackParam,
        device: $cordovaDevice.getDevice(),
        connection: $cordovaNetwork.getNetwork()
      };
      $scope.feedbackButton.current = $scope.feedbackButton.loading;

      $timeout(function() {
        $http.post('http://www.ameyanaik.com/android/whatismyip_material/', postData).success(function(response) {
          //alert(response);
          //alert('success: ' + response.success);
          if (response.success) {
            $scope.feedbackButton.current = $scope.feedbackButton.sent;
            if (response.message) {
              $scope.feedbackButton.current.text = response.message;
            }
          } else {
            $scope.feedbackButton.current = $scope.feedbackButton.failed;
          }
          //$scope.myHTML = $sce.trustAsHtml(response);
          //$scope.alert = $scope.alertIPDetails.success;
        })
        .error(function() {
          $scope.myHTML = "";
          //$scope.alert = $scope.alertIPDetails.error;
        });
      }, 1000);
      /*
      $timeout(function() {
        $scope.feedbackButton.current = $scope.feedbackButton.sent;
        $scope.setView('main');
      }, 5000);
      */
      return false; //failed
    };
}]);