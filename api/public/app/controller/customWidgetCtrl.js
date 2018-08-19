(function() {
    'use strict';

    angular
        .module('CustomWidgetCtrl', ['ngRoute', 'widgetServices', 'commonServices'])
        .controller('customWidgetCtrl', function($routeParams, Widget, DateObject, $scope) {
            $scope.columns = [];
            $scope.records = [];
            $scope.print = false;
            $scope.skip = 0;
            $scope.tableContent = [];
            $scope.prevPage = function() {
                if (this.skip != 0) {
                    this.skip = this.skip - this.limit;
                    this.getWidgetDetails();
                }
            };
            $scope.nextPage = function() {
                this.skip = this.skip + this.limit;
                this.getWidgetDetails();
            };
            $scope.doPrint = function() {
                $scope.$emit("appLoading", true);
                this.print && Widget.print($scope.columns, $scope.tableContent).then(function(response) {
                    if (response.data.success) {
                        var ifr = $('<iframe id="secretIFrame" src="" style="display:none; visibility:hidden;"></iframe>');
                        $('body').append(ifr);
                        var iframeURL = response.data.url + "?temp=" + Date.now();
                        window.open(iframeURL);
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", response.data.message);
                    }
                });
            }
            $scope.widgetID = $routeParams.id;

            $scope.getWidgetDetails = function() {
                $scope.$emit("appLoading", true);
                Widget.getWidgetDetails(this.widgetID, this.skip).then(function(response) {
                    if (response.data.success) {
                        $scope.$emit("appLoading", false);
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
                        var dependent = row[value.context];
                        if (dependent) {
                            dependent = dependent[0];
                            if (dependent && dependent.length) {
                                val = dependent[value.name] ? dependent[value.name] : "";
                            } else {
                                val = "";
                            }
                        } else {
                            val = "";
                        }
                    }
                    values.push($scope.formatValue(val, value.type));
                });
                $scope.tableContent.push(values);
                return values;
            }
            $scope.formatValue = function(value, type) {
                if (type == "Date") {
                    return DateObject.ISOtoNepali(value, "");
                }
                return value;
            }
            if ($routeParams.id) {
                $scope.getWidgetDetails();
            }
        });
}());