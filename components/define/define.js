(function(){
	// new module called workoutlog.define
	angular.module('workoutlog.define', [
		// pass in ui-router
		'ui.router'
	])
	.config(defineConfig);
						// similar to saying require('stateProvider') in node
	function defineConfig($stateProvider){

		$stateProvider
			.state('define', {
				url: '/define',
				templateUrl: '/components/define/define.html',
				controller: DefineController,
				controllerAs: 'ctrl',
				bindToController: this,
				resolve: [
					'CurrentUser', '$q', '$state',
					function(CurrentUser, $q, $state){
						var deferred = $q.defer();
						if (CurrentUser.isSignedIn()){
							deferred.resolve();
						} else {
							deferred.reject();
							$state.go('signin');
						}
						return deferred.promise;
					}
				]
			});
	}

	defineConfig.$inject = [ '$stateProvider' ];

	function DefineController($state, DefineService){
		var vm = this;
		vm.definition = {};
		vm.saved = false;
		// hey = vm.definition.typeOptions[0].value;
		// called by define.html and takes definition and passes to DefineService
		vm.save = function(){
			DefineService.save(vm.definition)
			.then(function(){
				vm.saved = true;
			});
			// for testing
			console.log("You just logged a new definition!");
			console.log(vm.definition);
		};

	}

	// different way of ensuring minification doesn't mess up dependencies
	DefineController.$inject = [ '$state', 'DefineService' ];

})();