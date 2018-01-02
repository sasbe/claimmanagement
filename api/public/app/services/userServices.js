(function() {
    'use strict';

    angular
        .module('userServices', [])
        .factory('User', function($http) {
            var userFactory = {};
            userFactory.create = function(data) {
                return $http.post('/users/createUser', data)
            };
            userFactory.addClaim = function(data) {
                return $http.post('/claims/addClaim', data);
            }
            userFactory.getUsers = function(queryString) {
                return $http.get("/users/userList?" + queryString);
            }
            userFactory.getUserDetails = function(userid) {
                return $http.get("/users/individual/" + userid);
            }
            userFactory.updateUser = function(userid, userData) {
                return $http.put("/users/updateUser/" + userid, userData);
            }
            userFactory.changePassword = function(userid, userData) {
                return $http.post("/users/changePassword/" + userid, userData);
            }
            userFactory.deleteUser = function(userid) {
                return $http.delete("/users/deleteUser/" + userid);
            }
            return userFactory;
        })

}());