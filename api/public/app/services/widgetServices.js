(function() {
    'use strict';

    angular
        .module('widgetServices', [])
        .service('Widget', function($http) {
            this.baseUrl = "/widgets";
            this.getWidgets = function() {
                return $http.get(this.baseUrl);
            }
            this.getSchemaDetails = function() {
                return $http.get(this.baseUrl + '/schemadetails');
            }
            this.addWidget = function(widget) {
                return $http.post(this.baseUrl, { widget: widget });
            }
            this.saveWidget = function(widget) {
                return $http.put(this.baseUrl, { widget: widget });
            }
            this.deleteWidget = function(widgetID) {
                return $http.delete(this.baseUrl + "/" + widgetID);
            }

            this.getWidgetList = function() {
                return $http.get(this.baseUrl + "/widgetlist")
            }

            this.getWidgetDetails = function(widgetID) {
                return $http.get(this.baseUrl + "/" + widgetID);
            }
        })

}());