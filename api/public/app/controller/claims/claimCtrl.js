(function() {
    'use strict';

    angular
        .module('claimControllers', ['claimServices', 'commonServices'])
        .controller('createClaimCtrl', function($location, $timeout, Claim, DateObject, $scope) {
            var controllerScope = this;
            controllerScope.claimData = {
                claimdate: (new Date()).toISOString(),
                claimamount: 0
            };
            controllerScope.addClaim = function() {
                controllerScope.claimData.sequenceName = DateObject.ISOtoNepali(controllerScope.claimData.claimdate);
                $scope.$emit("appLoading", true);
                Claim.addClaim(controllerScope.claimData).then(function(data) {
                    if (data.data.success) {
                        $timeout(function() {
                            $location.path('/');
                        }, 2000);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    controllerScope.appLoading = false;
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
        })

}());