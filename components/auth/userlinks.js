// userlinks directive

(function(){

	angular.module('workoutlog')
		.directive('userlinks',
			function(){
				UserLinksController.$inject = [ '$state', 'CurrentUser', 'SessionToken'];
				function UserLinksController($state, CurrentUser, SessionToken) {
					var vm = this;
					vm.user = function(){
						return CurrentUser.get();
					};

					vm.signedIn = function(){
					// !! turns this into a boolean type - in this case, if there's an id, return TRUE
						return !!(vm.user().id);
					};

					vm.logout = function(){
						CurrentUser.clear();
						SessionToken.clear();
						$state.go('signup');
					};
				}

				return {
					scope: {},
					controller: UserLinksController,
					controllerAs: 'ctrl',
					bindToController: true,
					templateUrl: '/components/auth/userlinks.html'
				};
			});

})();