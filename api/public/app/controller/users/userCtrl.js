(function() {
    'use strict';

    angular
        .module('userControllers', ['userServices'])
        .controller('regCtrl', function($location, $timeout, User, $scope) {
            var controllerScope = this;
            controllerScope.regData = {
                availableLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            }
            controllerScope.regUser = function() {
                $scope.$emit("appLoading", true);
                User.create(controllerScope.regData).then(function(data) {
                    $scope.$emit("appLoading", false);
                    if (data.data.success) {
                        $scope.$emit("successReceived", data.data.message + '......Redirecting');
                        $timeout(function() {
                            $location.url('/');
                        }, 2000);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
        })
        .controller('facebookCtrl', function($routeParams, Auth, $window, $location) {
            var controllerScope = this;
            if ($window.location.pathname == "/facebookerror") {
                $scope.$emit("errorReceived", "facebook email not found in databse");
            } else {
                Auth.facebook($routeParams.token);
                $location.path('/');
            }
        }).controller('changePassword', function($location, Auth, $timeout, User, $scope) {
            var controllerScope = this;
            controllerScope.userData = {
                oldP: "",
                newP: "",
                confirmP: ""
            };
            console.log("change password loaded");
            controllerScope.updatePassword = function() {
                console.log($scope)
                User.changePassword($scope.$parent.main.userDetails.employeenumber, controllerScope.userData).then(function(data) {
                    $scope.$emit("appLoading", false);
                    if (data.data.success) {
                        $scope.$emit("successReceived", data.data.message + '......Redirecting');
                        Auth.logOut();
                        $timeout(function() {
                            $location.url('/');
                        }, 2000);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }

        })

}());