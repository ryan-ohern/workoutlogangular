(function(){

	angular.module('workoutlog.history', [
		'ui.router'
		])
	.config(historyConfig);

	function historyConfig($stateProvider){
		$stateProvider
			.state('history', {
				url: '/history',
				templateUrl: '/components/history/history.html',
				controller: HistoryController,
				controllerAs: 'ctrl',
				bindToController: true,
				resolve: {
					getUserLogs: [
						'LogsService',
						function(LogsService) {
							return LogsService.fetch();
						}
					]
				}
			});
	}

	historyConfig.$inject = [ '$stateProvider' ];

	function HistoryController(LogsService){
		vm = this;
		vm.history = LogsService.getLogs();
	}

	HistoryController.$inject = [ 'LogsService' ];
})();