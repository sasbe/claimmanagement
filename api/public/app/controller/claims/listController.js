(function () {
    'use strict';

    angular
        .module('ClaimListControllers', ['claimServices', 'commonServices'])
        .controller('claimListController', function ($scope, Claim, Query) {
            var controllerScope = this;
            $scope.sort = {
                sortingOrder: 'claimno',
                reverse: false
            };

            $scope.prevPage = function () {
                if (controllerScope.filters.skip > 0) {
                    controllerScope.filters.decreaseSkip();
                    retrieveClaims(controllerScope.filters.formQueryString());
                }
            };

            $scope.nextPage = function () {
                controllerScope.filters.increaseSkip();
                retrieveClaims(controllerScope.filters.formQueryString());
            };
            controllerScope.claims = [];
            $scope.getAll = false;
            $scope.$watch("getAll", function () {
                if ($scope.getAll == true)
                    controllerScope.filters.limit = null;
                else
                    controllerScope.filters.limit = 10;
            });
            controllerScope.filters = new Query();

            var retrieveClaims = function (queryFilter) {
                $scope.$emit("appLoading", true);
                Claim.getClaims(queryFilter).then(function (response) {
                    if (response.data.success) {
                        controllerScope.claims = response.data.claims;
                    } else {
                        $scope.$emit("errorReceived", response.data.message);
                    }
                    $scope.$emit("appLoading", false);
                },
                    function (response) {
                        $scope.$emit("errorReceived", response.statusText);
                        $scope.$emit("appLoading", false);
                    });

            }
            controllerScope.print = function () {
                $scope.$emit("appLoading", true);
                Claim.print(controllerScope.claims).then(function (response) {
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
            controllerScope.applyFilter = function () {
                controllerScope.filters.skip = 0;
                retrieveClaims(controllerScope.filters.formQueryString());
            }


            $(window).resize(function () {
                if (window.innerWidth <= 768) {
                    controllerScope.disableScroll = function () {
                        $('html').css('overflow', "hidden");
                    }
                    $('.filter>div:first').css('display', 'none');
                    $(document).on("touchstart", function () {
                        $('.filter>div:first').css('display', 'none');
                    }).on("touchend", function () {
                        $('.filter>div:first').css({ 'display': '', "top": $(window).height() + $(window).scrollTop() - 28 });
                        var top = 52;
                        if ($(window).scrollTop() > top) {
                            top = 0;
                        }
                        $('#filterContainer').css({ "top": $(window).scrollTop() + top, "height": $(window).height() + $(window).scrollTop() - 28 });
                    });
                } else {
                    $(document).off("touchstart").off("touchend");
                    $('.filter>div:first').css('display', '').css("top", "");
                    $('#filterContainer').css("top", "").css("height", "");
                    $('html').css('overflow', "");
                    controllerScope.disableScroll = function () {
                        $('html').css('overflow', "");
                    }
                }
            })
            $(window).trigger('resize');

            retrieveClaims(controllerScope.filters.formQueryString());

        })
        .controller('todayListController', function ($scope, Claim, Query, $mdDialog, $window, $timeout) {
            var controllerScope = this;
            $scope.sort = {
                sortingOrder: 'claimno',
                reverse: false
            };
            $scope.title = '';
            $scope.body = '';

            $scope.prevPage = function () {
                if (controllerScope.filters.skip > 0) {
                    controllerScope.filters.decreaseSkip();
                    retrieveClaims(controllerScope.filters.formQueryString());
                }
            };

            $scope.nextPage = function () {
                controllerScope.filters.increaseSkip();
                retrieveClaims(controllerScope.filters.formQueryString());
            };
            // controllerScope.claims = [];
            $scope.getAll = false;
            $scope.$watch("getAll", function () {
                if ($scope.getAll == true)
                    controllerScope.filters.limit = null;
                else
                    controllerScope.filters.limit = 10;
            });
            controllerScope.filters = new Query();
            var toDate = new Date()
            //reset to begining of day
            toDate.setHours(0, 0, 0, 0);
            controllerScope.filters.fromdate = toDate.toISOString();
            var retrieveClaims = function (queryFilter) {
                $scope.$emit("appLoading", true);
                Claim.getClaims(queryFilter).then(function (response) {
                    if (response.data.success) {
                        controllerScope.claims = response.data.claims;
                    } else {
                        $scope.$emit("errorReceived", response.data.message);
                    }
                    $scope.$emit("appLoading", false);
                },
                    function (response) {
                        $scope.$emit("errorReceived", response.statusText);
                        $scope.$emit("appLoading", false);
                    });

            }
            function printDialogController($scope, $mdDialog) {
                $scope.title = "डिस्चार्ज भौचर सहि गरि पठाइएको छ |";
                $scope.body = "श्री प्रभू ईन्स्योरेन्स लिमि६े८" +
                    "केन्द्रीय कार्यालय, तिनकूने का७मा०८ौं ।" +
                    "" +
                    "प्रस्तूत विषयमा यस कम्पनीका निम्न लिखित कर्मचारीहरुको तहांबा६ प्राप्त औषधी उपचार ८िस्चार्ज भौचर सही ५ाप गरी यसै पत्र साथ " +
                    "प७ाइएको व्यहोरा अनूरोध गरिन्५ । " +
                    "सो  प्राप्त भएप५ि दावी रकम यथासि३्र उपलब्ध गराई दिन’ह’न अन’रोध गरिन्५ ।";
                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.answer = function () {
                    $mdDialog.hide($scope);
                };
            }
            controllerScope.print = function (ev) {
                $mdDialog.show({
                    controller: printDialogController,
                    templateUrl: 'app/pages/dialogs/printDialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function (dialogScope) {
                        if(dialogScope){
                            $scope.title = dialogScope.title;
                            $scope.body = dialogScope.body;
                            $timeout($window.print);
                        }
                    });
            }
            controllerScope.applyFilter = function () {
                controllerScope.filters.skip = 0;
                retrieveClaims(controllerScope.filters.formQueryString());
            }


            $(window).resize(function () {
                if (window.innerWidth <= 768) {
                    controllerScope.disableScroll = function () {
                        $('html').css('overflow', "hidden");
                    }
                    $('.filter>div:first').css('display', 'none');
                    $(document).on("touchstart", function () {
                        $('.filter>div:first').css('display', 'none');
                    }).on("touchend", function () {
                        $('.filter>div:first').css({ 'display': '', "top": $(window).height() + $(window).scrollTop() - 28 });
                        var top = 52;
                        if ($(window).scrollTop() > top) {
                            top = 0;
                        }
                        $('#filterContainer').css({ "top": $(window).scrollTop() + top, "height": $(window).height() + $(window).scrollTop() - 28 });
                    });
                } else {
                    $(document).off("touchstart").off("touchend");
                    $('.filter>div:first').css('display', '').css("top", "");
                    $('#filterContainer').css("top", "").css("height", "");
                    $('html').css('overflow', "");
                    controllerScope.disableScroll = function () {
                        $('html').css('overflow', "");
                    }
                }
            })
            $(window).trigger('resize');

            retrieveClaims(controllerScope.filters.formQueryString());

        });
}());