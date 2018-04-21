(function() {
    'use strict';

    angular
        .module('ValueFormatter', ["commonServices"])
        .filter('valueFormat', ValueFormatter)

    function ValueFormatter(DateObject) {

        return FilterFn;

        function FilterFn(value, type) {
            switch (type) {
                case "Date":
                    value = DateObject.ISOtoNepali(value, "");
                    break;

                default:
                    break;
            }
            return value
        }
    }

}());