(function(){

	angular.module('workoutlog.logs', [
		'ui.router'
	])
	.config(logsConfig);

	function logsConfig($stateProvider){

		$stateProvider
			.state('logs', {
				url: '/logs',
				templateUrl: '/components/logs/logs.html',
				controller: LogsController,
				controllerAs: 'ctrl',
				bindToController: true,
				resolve: {
					getUserDefinitions: [
						'DefineService',
						function(DefineService) {
							return DefineService.fetch();
						}
					]
				}
			});
	}

	logsConfig.$inject = [ '$stateProvider' ];

	function LogsController($state, DefineService, LogsService){
		var vm = this;
		vm.log = {};
		vm.saved = false;
		vm.userDefinitions = DefineService.getDefinitions();
		vm.save = function(log){
			LogsService.save(vm.log)
			.then(function(){
				vm.saved = true;
			});
			console.log("You just saved a new log!");
			console.log(vm.log);
			console.log(vm.log.def);
		};
	}

	LogsController.$inject = [ '$state', 'DefineService', 'LogsService'];

})();