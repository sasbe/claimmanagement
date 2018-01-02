(function() {
    angular.module('mainControllers', ['authServices'])
        .controller("mainCtrl", function($location, $timeout, Auth, AuthToken, $window, $rootScope, $scope) {
            var controllerScope = this;
            $rootScope.$on('errorReceived', function(event, data) {
                controllerScope.appLoading = false;
                controllerScope.errorMessage = data;
                controllerScope.successMessage = false;
            });
            $rootScope.$on('successReceived', function(event, data) {
                controllerScope.appLoading = false;
                controllerScope.errorMessage = false;
                controllerScope.successMessage = data;
            });
            $rootScope.$on("appLoading", function(event, data) {
                controllerScope.appLoading = data;
            });

            $rootScope.$on('$routeChangeStart', function(event, next, current) {
                $scope.$emit("appLoading", true);
                controllerScope.successMessage = false;
                controllerScope.errorMessage = false;
                if (Auth.isLoggedIn()) {
                    controllerScope.isLoggedIn = true;
                    Auth.getUser().then(function(data) {
                        if (data.data.success === true) {
                            controllerScope.userDetails = {
                                username: data.data.userDetails.username,
                                email: data.data.userDetails.emailid,
                                employeenumber: data.data.userDetails.employeenumber
                            }
                            controllerScope.isAdmin = data.data.userDetails.role === "super" ? true : false;
                        } else {
                            AuthToken.setToken();
                            controllerScope.userDetails = undefined;
                            controllerScope.isAdmin = false;
                            console.log("User is not logged in");
                            controllerScope.isLoggedIn = false;
                            $location.path('/login');
                        }
                    });
                } else {
                    controllerScope.userDetails = undefined;
                    controllerScope.isAdmin = false;
                    console.log("User is not logged in");
                    controllerScope.isLoggedIn = false;
                }
                if ($location.hash() == '_=_') {
                    $location.hash(null);
                }
            });
            $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
                $scope.$emit("appLoading", false);
            });
            controllerScope.loginData = {
                employeenumber: '',
                password: ''
            };
            controllerScope.doLogin = function() {
                $scope.$emit("appLoading", true);
                Auth.login(controllerScope.loginData).then(function(data) {
                    if (data.data.success) {
                        $timeout(function() {
                            $location.url('/');
                            controllerScope.successMessage = false;
                            controllerScope.loginData = '';
                        }, 2000);
                    } else {
                        controllerScope.errorMessage = data.data.message;
                        $scope.$emit("appLoading", false);
                    }
                })
            }

            controllerScope.logOut = function() {
                $rootScope.$emit("appLoading", true);
                Auth.logOut();
                $location.path('/login');
                $rootScope.$emit("appLoading", false);
            };

            controllerScope.facebook = function() {
                $window.location = $window.location.protocol + "//" + $window.location.host + "/auth/facebook";
            };
        });
}());