(function() {
    'use strict';

    angular
        .module('UserListControllers', ['userServices', 'commonServices'])
        .controller('userListController', function($scope, $location, $timeout, User, Query, $http) {
            var controllerScope = this;
            $scope.sort = {
                sortingOrder: 'employeenumber',
                reverse: false
            };

            $scope.prevPage = function() {
                if (controllerScope.filters.skip > 0) {
                    controllerScope.filters.decreaseSkip();
                    retrieveUsers(controllerScope.filters.formQueryString());
                }
            };

            $scope.nextPage = function() {
                controllerScope.filters.increaseSkip();
                retrieveUsers(controllerScope.filters.formQueryString());
            };
            controllerScope.users = [];

            controllerScope.filters = new Query();

            var retrieveUsers = function(queryFilter) {
                $scope.$emit("appLoading", true);
                User.getUsers(queryFilter).then(function(response) {
                        if (response.data.success) {
                            controllerScope.users = response.data.users;
                        } else {
                            $scope.$emit("errorReceived", response.data.message);
                        }
                        $scope.$emit("appLoading", false);
                    },
                    function(response) {
                        $scope.$emit("errorReceived", response.statusText);
                        $scope.$emit("appLoading", false);
                    });

            }

            controllerScope.applyFilter = function() {
                controllerScope.filters.skip = 0;
                retrieveUsers(controllerScope.filters.formQueryString());
            }


            $(window).resize(function() {
                if (window.innerWidth <= 768) {
                    controllerScope.disableScroll = function() {
                        $('html').css('overflow', "hidden");
                    }
                    $('.filter>div:first').css('display', 'none');
                    $(document).on("touchstart", function() {
                        $('.filter>div:first').css('display', 'none');
                    }).on("touchend", function() {
                        $('.filter>div:first').css({ 'display': '', "top": $(window).height() + $(window).scrollTop() - 28 });
                        var top = 52;
                        if ($(window).scrollTop() > top) {
                            top = 0;
                        }
                        $('#filterContainer').css({ "top": $(window).scrollTop() + top, "height": $(window).height() + $(window).scrollTop() - 28 });
                    });
                } else {
                    $(document).off("touchstart").off("touchend");
                    $('.filter>div:first').css('display', '').css("top", "");
                    $('#filterContainer').css("top", "").css("height", "");
                    $('html').css('overflow', "");
                    controllerScope.disableScroll = function() {
                        $('html').css('overflow', "");
                    }
                }
            })
            $(window).trigger('resize');

            retrieveUsers(controllerScope.filters.formQueryString());

        });
}());