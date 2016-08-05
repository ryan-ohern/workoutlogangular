(function(){

	angular.module('workoutlog')
		.service('LogsService', LogsService);

		LogsService.$inject = [ '$http', 'API_BASE' ];
		function LogsService($http, API_BASE) {
			// setting logsService = to 'this' allows us to use logsService instead of $scope
			var logsService = this;
			logsService.workouts = [];

			logsService.save = function(log) {
				return $http.post(API_BASE + 'log', {
					log: log
				}).then(function(response){
					logsService.workouts.push(response.data);
					console.log(log);
				});
			};

			logsService.delete = function(log) {
				return $http.delete(API_BASE + 'log', {
					log: log
				}).then(function(response){
					logsService.workouts.push(response.data);
					console.log(log);
				});
			};

			logsService.fetch = function(){
				return $http.get(API_BASE + 'log')
					.then(function(response){
						logsService.workouts = response.data;
					});
				};

			logsService.getLogs = function(){
				return logsService.workouts;
			};
		}	
})();