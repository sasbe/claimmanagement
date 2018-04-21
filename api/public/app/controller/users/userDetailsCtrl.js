(function() {
    'use strict';

    angular
        .module('UserDetailsController', ['userServices', 'dependentService', 'ngRoute', 'ngMaterial'])
        .controller('userDetails', function($scope, $location, $timeout, User, DependentService, $routeParams, $mdDialog) {
            var controllerScope = this;
            controllerScope.editMode = false;
            controllerScope.userID = $routeParams.id;
            controllerScope.availableLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            User.getUserDetails(controllerScope.userID).then(function(data) {
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

            //dependents related changes
            //Get function to populate the UI-Grid


            $scope.getDependents = function() {
                //emit apploading
                $scope.$emit("appLoading", true);
                //Function load the data from database
                DependentService.getDependents(controllerScope.userID).then(function(data) {
                    if (data.data.success) {
                        $scope.dependents = data.data.dependents;
                        //emit apploading
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
            $scope.availableRelationship = ['Spouse', 'Father', 'Mother', 'Daughter', 'Son', 'Father in-law', 'Mother in-law'];
            $scope.addDependent = function(row) {
                //emit apploading
                $scope.$emit("appLoading", true);
                DependentService.addDependent(controllerScope.userID, row).then(function(data) {
                    if (data.data.success) {
                        $scope.getDependents();
                        //emit apploading
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }

            $scope.showEditDialog = function(ev, row) {
                //Get the index of selected row from row object
                $mdDialog.show({
                        controller: controller(row),
                        templateUrl: 'app/pages/dialogs/dependent.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true
                    })
                    .then(function(row) {
                        if (row._id) {
                            $scope.saveRow(row);
                        } else {
                            $scope.addDependent(row);
                        }
                    }, function() {
                        console.log("dialog closed");
                    });
            };

            $scope.saveRow = function(row) {
                //emit apploading
                $scope.$emit("appLoading", true);
                //Call the function to save the data to database
                DependentService.updateDependent(controllerScope.userID, row).then(function(data) {
                    if (data.data.success) {
                        $scope.getDependents();
                        //emit apploading
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            };

            $scope.deleteRow = function(row) {
                //Display a confirm message box before deleting records
                var returnvalue = confirm("Are you sure to delete dependent '" + row.dependentName + "'");
                //Delete the row only if user selects ok
                if (returnvalue == true) {
                    //emit apploading
                    $scope.$emit("appLoading", true);
                    //Call the factory function to delete the customer
                    DependentService.deleteDependent(row._id).then(function(data) {
                        if (data.data.success) {
                            //emit apploading
                            $scope.$emit("appLoading", false);
                            $scope.getDependents();
                        } else {
                            $scope.$emit("errorReceived", data.data.message);
                        }
                    }, function(response) {
                        $scope.$emit("errorReceived", response.statusText);
                    });
                }
            };
            //Call  function to load the data
            $scope.getDependents();

            function controller(row) {
                return function($scope, $mdDialog) {
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };

                    $scope.answer = function() {
                        $mdDialog.hide($scope.dependent);
                    };
                    if (row) {
                        $scope.dependent = row;
                    } else {
                        $scope.dependent = {
                            dependentName: "",
                            relationshipType: "Spouse"
                        }
                    }
                    $scope.relationshipTypes = [
                        "Spouse", "Daughter", "Son", "Father", "Mother", "Father in-law", "Mother in-law"
                    ];
                }
            }
        });
}());