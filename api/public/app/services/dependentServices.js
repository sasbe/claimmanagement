(function() {
    'use strict';

    angular
        .module('dependentService', [])
        .factory('DependentService', function($http) {
            let dependentService = {};
            dependentService.getDependents = function(userid) {
                return $http.get("/users/dependents/" + userid);
            };
            dependentService.updateDependent = function(userid, dependentData) {
                return $http.put("/users/dependents/" + userid, dependentData);
            };
            dependentService.addDependent = function(userid, dependentData) {
                return $http.post("/users/dependents/" + userid, dependentData);
            };
            dependentService.deleteDependent = function(dependentId) {
                return $http.delete("/users/dependents/" + dependentId);
            };
            return dependentService;
        })

}());