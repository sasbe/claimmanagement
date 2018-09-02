(function () {
    'use strict';

    angular
        .module('claimControllers', ['claimServices', 'commonServices'])
        .controller('createClaimCtrl', function ($location, $timeout, $http, Claim, DateObject, $scope) {
            var controllerScope = this;
            controllerScope.claimData = {
                claimdate: (new Date()).toISOString(),
                claimamount: 0,
                dependentId: 'SELF'
            };
            controllerScope.disabledDependent = true;
            if (!$scope.$parent.main.isAdmin) {
                controllerScope.disabledAutoComplete = true;
                $scope.selectedItem = $scope.$parent.main.userDetails.employeenumber;
            }
            controllerScope.addClaim = function () {
                controllerScope.claimData.sequenceName = DateObject.ISOtoNepali(controllerScope.claimData.claimdate);
                $scope.$emit("appLoading", true);
                Claim.addClaim(controllerScope.claimData).then(function (data) {
                    if (data.data.success) {
                        $timeout(function () {
                            $location.path('/');
                        }, 2000);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function (response) {
                    controllerScope.appLoading = false;
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
            controllerScope.getMatches = function (searchText) {
                return $http
                    .get('/users/search/' + searchText)
                    .then(function (data) {
                        // Map the response object to the data object.
                        return data.data.users;
                    });
            };
            controllerScope.getMatchedDependents = function (searchText) {
                return $http
                    .get('/users/dependents/search/' + searchText +'?employeeid='+controllerScope.empID)
                    .then(function (data) {
                        // Map the response object to the data object.
                        data.data.dependents.push({ dependentName: "SELF", relationshipType: "OWN" });
                        return data.data.dependents;
                    });
            };

            controllerScope.selectedItemChange = function (item) {
                if (item) {
                    controllerScope.claimData.employeeid = item._id;
                    controllerScope.empID = item._id;
                    controllerScope.disabledDependent = false;
                }
                else {
                    controllerScope.claimData.employeeid = "";
                    controllerScope.disabledDependent = true;
                    controllerScope.empID = "";
                }
            }
            controllerScope.selectedDependentChange = function (item) {
                if (item) {
                    controllerScope.claimData.dependentId = item._id;
                }
            }
            controllerScope.clearDependent = function(){
                controllerScope.claimData.dependentId = 'SELF';
                $scope.selectedDependent = 'SELF';
            }
        })

}());