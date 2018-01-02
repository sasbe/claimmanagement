(function() {
    'use strict';

    angular.module('userApp', ['appRoutes', 'userControllers', 'mainControllers', 'claimControllers', 'homeController', 'ClaimListControllers', 'UserListControllers',
            'CommonDirectives', 'ClaimDetailsController', 'UserDetailsController', 'userServices', 'claimServices', 'commonServices', 'authServices', 'ngAnimate', 'ngMaterial','ngMessages'
        ])
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptors');
        });

}());