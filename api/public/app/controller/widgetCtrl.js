(function() {
    'use strict';

    angular
        .module('WidgetController', ['widgetServices', 'ngMaterial'])
        .controller('widgetsCtrl', function(Widget, $mdDialog, $scope) {
            var controllerScope = this;
            $scope.getWidgets = function() {
                Widget.getWidgets().then(function(response) {
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
            }
            $scope.showEditDialog = function(ev, widget) {
                //Get the index of selected row from row object
                if (!$scope.schemadetails) {
                    Widget.getSchemaDetails().then(function(response) {
                        $scope.schemadetails = response.data.schemas;
                        $mdDialog.show({
                                controller: controller(widget, $scope.schemadetails),
                                templateUrl: 'app/pages/dialogs/addWidget.html',
                                parent: angular.element(document.body),
                                targetEvent: ev,
                                clickOutsideToClose: true
                            })
                            .then(function(widget) {
                                if (widget._id) {
                                    $scope.saveWidget(widget);
                                } else {
                                    $scope.addWidget(widget);
                                }
                            }, function() {
                                console.log("dialog closed");
                            });
                    })
                } else {
                    $mdDialog.show({
                            controller: controller(widget, $scope.schemadetails),
                            templateUrl: 'app/pages/dialogs/addWidget.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            clickOutsideToClose: true
                        })
                        .then(function(widget) {
                            if (widget._id) {
                                $scope.saveWidget(widget);
                            } else {
                                $scope.addWidget(widget);
                            }
                        }, function() {
                            console.log("dialog closed");
                        });
                }
            };
            $scope.addWidget = function(widget) {
                $scope.$emit("appLoading", true);
                Widget.addWidget(widget).then(function(data) {
                    if (data.data.success) {
                        $scope.getWidgets();
                        //emit apploading
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
            $scope.saveWidget = function(widget) {
                Widget.saveWidget(widget).then(function(data) {
                    if (data.data.success) {
                        $scope.getWidgets();
                        //emit apploading
                        $scope.$emit("appLoading", false);
                    } else {
                        $scope.$emit("errorReceived", data.data.message);
                    }
                }, function(response) {
                    $scope.$emit("errorReceived", response.statusText);
                });
            }
            $scope.deleteWidget = function(widgetID) {
                if (widgetID) {
                    Widget.deleteWidget(widgetID).then(function(data) {
                        if (data.data.success) {
                            $scope.getWidgets();
                            //emit apploading
                            $scope.$emit("appLoading", false);
                        } else {
                            $scope.$emit("errorReceived", data.data.message);
                        }
                    }, function(response) {
                        $scope.$emit("errorReceived", response.statusText);
                    });
                }
            }
            $scope.getWidgets();

            function controller(widget, schemadetails) {
                return function($scope, $mdDialog) {
                    $scope.schemadetails = schemadetails;
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                    $scope.answer = function() {
                        $mdDialog.hide($scope.widget);
                    };
                    if (widget) {
                        $scope.widget = widget;
                    } else {
                        $scope.widget = {
                            name: "Claim view",
                            description: "A table record",
                            order: 0,
                            print: false,
                            limit: 10,
                            query: []
                        }
                    }
                    $scope.hasColumn = function(key, columnName) {
                        var queries = this.widget.query;
                        for (var i = 0; i < queries.length; i++) {
                            var context = queries[i].context;
                            var name = queries[i].name;
                            if (context == key && name == columnName) {
                                return true;
                            }
                        }
                        return false;
                    }
                    $scope.selectColumn = function(ev, key, columnName, type) {
                        console.log(key);
                        if (ev.currentTarget.attributes.checked) {
                            //remove from key
                            var index = this.getIndex(key, columnName);
                            if (index <= 0) {
                                $scope.widget.query.splice(index);
                            }
                        } else {
                            // add columns
                            $scope.widget.query.push({
                                name: columnName,
                                displayName: columnName,
                                context: key,
                                type: type
                            })
                        }
                    }
                    $scope.getIndex = function(key, columnName) {
                        var queries = this.widget.query;
                        for (var i = 0; i < queries.length; i++) {
                            var context = queries[i].context;
                            var name = queries[i].name;
                            if (context == key && name == columnName) {
                                return i;
                            }
                        }
                        return -1;
                    }
                }
            }
        });
}());