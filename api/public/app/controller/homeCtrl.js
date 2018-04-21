(function() {
    'use strict';

    angular
        .module('homeController', ['widgetServices'])
        .controller('home', function(Widget, $scope) {
            $scope.widgets = [];
            Widget.getWidgetList().then(function(response) {
                $scope.$emit("appLoading", true);
                if (response.data.success) {
                    $scope.$emit("appLoading", false);
                    $scope.widgets = response.data.widgets;
                } else {
                    $scope.$emit("errorReceived", response.data.message);
                }
            }, function(response) {
                $scope.$emit("errorReceived", response.statusText);
            });
            $scope.getTheme = function(index) {
                if (index % 2 == 0) {
                    return "dark-blue";
                }
                return "dark-purple";
            }
        });
})()