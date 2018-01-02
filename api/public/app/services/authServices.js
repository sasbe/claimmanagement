(function() {
    angular.module("authServices", [])
        .factory('Auth', function($http, AuthToken, $window) {
            var authFactory = {};
            authFactory.login = function(loginData) {
                return $http.post("/users/authenticate", loginData).then(function(data) {
                    AuthToken.setToken(data.data.token);
                    return data;
                });
            }
            authFactory.isLoggedIn = function() {
                return AuthToken.getToken() ? true : false;
            }

            authFactory.logOut = function() {
                AuthToken.setToken();
            }
            authFactory.facebook = function(token) {
                AuthToken.setToken(token);
            }
            authFactory.getUser = function() {
                if (AuthToken.getToken()) {
                    return $http.post('/users/me');
                } else {
                    $q.reject({ message: "Annonymous access" });
                }
            }
            return authFactory;
        })
        .factory('AuthToken', function() {
            var authTokenFactory = {};
            authTokenFactory.setToken = function(token) {
                if (token) {
                    window.localStorage.setItem('token', token);
                } else {
                    window.localStorage.removeItem('token');
                }
            }
            authTokenFactory.getToken = function() {
                return window.localStorage.getItem('token');
            }
            return authTokenFactory;
        })
        .factory('AuthInterceptors', function(AuthToken) {
            var authInterceptors = {};
            authInterceptors.request = function(config) {
                var token = AuthToken.getToken();
                if (token) {
                    config.headers['x-access-token'] = token;
                }
                return config;
            }
            return authInterceptors;
        })
})();