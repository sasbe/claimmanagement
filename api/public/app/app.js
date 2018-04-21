(function() {
    'use strict';

    angular.module('userApp', ['appRoutes', 'userControllers', 'mainControllers', 'claimControllers',
            'homeController', 'WidgetController', 'CustomWidgetCtrl',
            'ClaimListControllers', 'UserListControllers',
            'CommonDirectives', 'analyticsController', 'ClaimDetailsController',
            'UserDetailsController', 'userServices', 'dependentService', 'claimServices', 'commonServices',
            'authServices', 'ValueFormatter',
            'ngAnimate', 'ngMaterial', 'ngMessages'
        ])
        .config(function($httpProvider, $mdThemingProvider) {

            $mdThemingProvider.theme('dark-purple').backgroundPalette('purple', {
                'hue-1': '500'
            }).dark();
            $mdThemingProvider.theme('dark-blue').backgroundPalette('blue', {
                'hue-1': '500'
            }).dark();
            $httpProvider.interceptors.push('AuthInterceptors');
        });

}());