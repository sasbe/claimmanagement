(function () {
    'use strict';

    angular
        .module('claimControllers', ['claimServices', 'commonServices'])
        .controller('createClaimCtrl', function ($location, $timeout, $http, Claim, DateObject, $scope) {
            var controllerScope = this;
            controllerScope.claimData = {
                claimdate: (new Date()).toISOString(),
                claimamount: 0
            };
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

            controllerScope.selectedItemChange = function (item) {
                if (item) {
                    controllerScope.claimData.employeeno = item.employeenumber;
                }
                else {
                    controllerScope.claimData.employeeno = "";
                }
            }
        })

}());