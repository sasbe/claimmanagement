(function() {
    'use strict';

    angular
        .module('commonServices', [])
        .factory('Query', function() {
            function QueryObject() {
                this.skip = 0;
                this.limit = 5;
                this.fromDate = null;
                this.todate = (new Date()).toISOString();
                this.dateType = "claimdate";
                this.empno = null;
                this.calimno = null;
            }
            QueryObject.prototype.formQueryString = function() {
                var querystring = "";
                for (var name in this) {
                    if (Object.prototype.hasOwnProperty.call(this, name)) {
                        if (this[name] != undefined || this[name] != null) {
                            if (querystring == "") {
                                querystring += name.toString() + "=" + this[name].toString();
                            } else {
                                querystring += "&" + name.toString() + "=" + this[name].toString();
                            }
                        }
                    }
                }
                return querystring;
            }
            QueryObject.prototype.decreaseSkip = function() {
                if (this.skip != 0) {
                    this.skip = this.skip - this.limit;
                }
            }
            QueryObject.prototype.increaseSkip = function() {
                this.skip = this.skip + this.limit;
            }

            return QueryObject;
        }).factory('DateObject', function() {
            var dateObject = {

            }
            dateObject.ISOtoNepali = function(isoValue, nullValue) {
                if (isoValue) {
                    var localeDate = new Date(isoValue)
                    return AD2BS(localeDate.getFullYear() + "-" + (localeDate.getMonth() + 1) + "-" + localeDate.getDate());
                }
                if (nullValue != undefined) {
                    return nullValue;
                }
                return isoValue;
            }
            return dateObject;
        })


}());