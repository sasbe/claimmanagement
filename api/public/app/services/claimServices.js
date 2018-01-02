(function() {
    'use strict';

    angular
        .module('claimServices', ['commonServices'])
        .factory('Claim', function($http, DateObject) {
            var claimFactory = {};
            claimFactory.addClaim = function(data) {
                return $http.post('/claims/addClaim', data);
            }
            claimFactory.getClaims = function(queryString) {
                return $http.get("/claims/claimList?" + queryString);
            }

            claimFactory.getClaimDetails = function(claimid) {
                return $http.get("/claims/individual/" + claimid);
            }

            claimFactory.updateClaim = function(claimid, claimData) {
                return $http.put("/claims/updateClaim/" + claimid, claimData);
            }

            claimFactory.print = function(claimData) {
                var claimDetails = angular.copy(claimData);
                for (var i = 0, length = claimDetails.length; i < length; i++) {
                    var claim = claimDetails[i];
                    claim.claimdate = DateObject.ISOtoNepali(claim.claimdate, "");
                    claim.dischargedate = DateObject.ISOtoNepali(claim.dischargedate, "");
                }
                return $http.post("/claims/print", claimDetails);
            }

            claimFactory.deleteClaim = function(userid) {
                return $http.delete("/claims/deleteClaim/" + userid);
            }
            return claimFactory;
        })

}());