require('angular');

angular.module('webApp').controller('forgingController', ['$scope', '$rootScope', '$http', "userService", "$interval", "companyModal", "forgingModal", "registrationDelegateModal", "delegateService",
    function ($rootScope, $scope, $http, userService, $interval, companyModal, forgingModal, registrationDelegateModal, delegateService) {
        $scope.address = userService.address;
        $scope.effectiveBalance = userService.effectiveBalance;
        $scope.totalBalance = userService.balance;
        $scope.unconfirmedBalance = userService.unconfirmedBalance;
        $scope.loadingBlocks = true;
        $scope.delegateInRegistration = userService.delegateInRegistration;

        $scope.getBlocks = function () {
            $http.get("/api/blocks", {
                params: {
                    generatorPublicKey: userService.publicKey,
                    limit: 20,
                    orderBy: "height:desc"
                }
            })
                .then(function (resp) {
                    $scope.blocks = resp.data.blocks;
                    $scope.loadingBlocks = false;
                });
        }

        $scope.getForgedAmount = function () {
            $http.get("/api/delegates/forging/getForgedByAccount", {params: {generatorPublicKey: userService.publicKey}})
                .then(function (resp) {
                    $scope.totalForged = resp.data.fees;
                });
        }

        $scope.getDelegate = function () {
            delegateService.getDelegate(userService.publicKey, function (response) {
                if ($scope.delegateInRegistration) {
                    $scope.delegateInRegistration = !(!!response);
                    userService.setDelegateProcess($scope.delegateInRegistration);
                }
                $scope.delegate = response;
                userService.setDelegate($scope.delegate);

            });
        }

        $scope.getForging = function () {
            $http.get("/api/delegates/forging/status", {params: {publicKey: userService.publicKey}})
                .then(function (resp) {
                    $scope.forging = resp.data.enabled;
                    userService.setForging($scope.forging);
                });
        }

        $scope.infoInterval = $interval(function () {
            $scope.getBlocks();
            $scope.getForgedAmount();
            $scope.getDelegate();
            $scope.getForging();
        }, 1000 * 30);


        $scope.getBlocks();
        $scope.getForgedAmount();
        $scope.getDelegate();
        $scope.getForging();


        $scope.enableForging = function () {
            $scope.forgingModal = forgingModal.activate({
                forging: false,
                totalBalance: userService.unconfirmedBalance,
                destroy: function () {
                    $scope.forging = userService.forging;
                    $scope.getForging();
                }
            })
        }

        $scope.disableForging = function () {
            $scope.forgingModal = forgingModal.activate({
                forging: true,
                totalBalance: userService.unconfirmedBalance,
                destroy: function () {
                    $scope.forging = userService.forging;
                    $scope.getForging();
                }
            })
        }

        $scope.registrationDelegate = function () {
            $scope.registrationDelegateModal = registrationDelegateModal.activate({
                totalBalance: userService.unconfirmedBalance,
                destroy: function () {
                    $scope.delegateInRegistration = userService.delegateInRegistration;
                    $scope.getDelegate();
                }
            })
        }

        $scope.newCompany = function () {
            $scope.companyModal = companyModal.activate({
                totalBalance: $scope.unconfirmedBalance,
                destroy: function () {
                    $scope.getInfo();
                }
            });
        }

    }]);