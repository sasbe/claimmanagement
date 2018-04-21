(function() {
    'use strict';

    angular
        .module('CustomWidgetCtrl', ['ngRoute', 'widgetServices', 'commonServices'])
        .controller('customWidgetCtrl', function($routeParams, Widget, DateObject, $scope) {
            $scope.columns = [];
            $scope.records = [];
            $scope.print = false;
            if ($routeParams.id) {
                Widget.getWidgetDetails($routeParams.id).then(function(response) {
                    if (response.data.success) {
                        $scope.columns = response.data.columns;
                        $scope.print = response.data.print;
                        $scope.records = response.data.records;
                        $scope.limit = response.data.limit;
                        $scope.description = response.data.description;
                    } else {
                        $scope.$emit("errorReceived", reponse.data.message);
                    }
                }, function() {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
            $scope.getRow = function(row) {
                var values = [];
                angular.forEach($scope.columns, function(value, key) {
                    var val = "";
                    if (value.context == 'claims') {
                        val = row[value.name];
                    } else {
                        var dependent = row[value.context][0];
                        if (dependent) {
                            val = dependent[value.name] ? dependent[value.name] : "";

                        } else {
                            val = "";
                        }
                    }
                    values.push($scope.formatValue(val, value.type));
                });
                return values;
            }
            $scope.formatValue = function(value, type) {
                if (type == "Date") {
                    return DateObject.ISOtoNepali(value, "");
                }
                return value;
            }

        });

}());