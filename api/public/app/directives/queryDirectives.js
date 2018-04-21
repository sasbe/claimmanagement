(function() {
    'use strict';

    angular
        .module('QueryDirective', [])
        .directive('queries', function() {
            return {
                link: link,
                restrict: 'AE',
                scope: {},
                template: ''
            }
        });




}());