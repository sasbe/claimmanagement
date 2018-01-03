(function () {
    'use strict';

    angular.module('userApp', ['appRoutes', 'userControllers', 'mainControllers', 'claimControllers', 'homeController', 'ClaimListControllers', 'UserListControllers',
        'CommonDirectives', 'ClaimDetailsController', 'UserDetailsController', 'userServices', 'claimServices', 'commonServices', 'authServices', 'ngAnimate', 'ngMaterial', 'ngMessages'
    ])
        .config(function ($httpProvider, $mdThemingProvider) {

            $mdThemingProvider.theme('dark-purple').backgroundPalette('purple', {
                'hue-1': '500'
            }).dark();
            $mdThemingProvider.theme('dark-blue').backgroundPalette('blue', {
                'hue-1': '500'
            }).dark();
            $httpProvider.interceptors.push('AuthInterceptors');
        });

}());