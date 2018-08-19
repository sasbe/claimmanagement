(function() {
    'use strict';

    angular
        .module('commonServices', [])
        .factory('Query', function() {
            function QueryObject() {
                this.skip = 0;
                this.limit = 10;
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
        }).factory('util', function() {
            var util = {

            }
            util.ArrayMove = function ArrayMove(array, from, to) {
                if (Math.abs(from - to) > 60) {
                    array.splice(to, 0, array.splice(from, 1)[0]);
                } else {
                    // works better when we are not moving things very far
                    var target = array[from];
                    var inc = (to - from) / Math.abs(to - from);
                    var current = from;
                    for (; current != to; current += inc) {
                        array[current] = array[current + inc];
                    }
                    array[to] = target;
                }
            }
            return util;
        })


}());