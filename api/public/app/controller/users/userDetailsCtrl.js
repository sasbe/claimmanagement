(function() {
    'use strict';

    angular
        .module('UserDetailsController', ['userServices', 'ngRoute'])
        .controller('userDetails', function($scope, $location, $timeout, User, $routeParams) {
            var controllerScope = this;
            controllerScope.editMode = false;
            controllerScope.availableLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            User.getUserDetails($routeParams.id).then(function(data) {
                if (data.data.success) {
                    controllerScope.userData = data.data.user;
                } else {
                    $scope.$emit("errorReceived", data.data.message);
                }
            }, function(response) {
                $scope.$emit("errorReceived", response.statusText);
            });
            controllerScope.changeMode = function() {
                if (controllerScope.editMode) {
                    //emit apploading
                    $scope.$emit("appLoading", true);
                    //save the content first
                    User.updateUser(controllerScope.userData._id, {
                        user: controllerScope.userData
                    }).then(function(response) {
                        if (!response.data.success) {
                            $scope.$emit("errorReceived", response.data.message);
                        }
                        $scope.$emit("appLoading", false);
                    }, function(response) {
                        $scope.$emit("errorReceived", response.statusText);
                    });
                    // then change the mode
                    controllerScope.editMode = !controllerScope.editMode;
                    //emit apploaded

                } else {
                    controllerScope.editMode = true;
                    controllerScope.oldData = angular.copy(controllerScope.userData);
                }
            }
            controllerScope.cancelEdit = function() {
                if (controllerScope.editMode) {
                    controllerScope.userData = controllerScope.oldData;
                    controllerScope.editMode = false;
                }
            }
            controllerScope.deleteUser = function() {
                $scope.$emit("appLoading", true);
                //save the content first
                User.deleteUser(controllerScope.userData._id).then(function(data) {
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
        });
}());