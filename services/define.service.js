(function(){

	angular.module('workoutlog')
		.service('DefineService', DefineService);

		DefineService.$inject = [ '$http', 'API_BASE' ];
		function DefineService($http, API_BASE) {
			var defineService = this;
			defineService.userDefinitions = [];

			defineService.save = function(definition) {
				// takes definition from DefineService and calls to API with $http.post
				return $http.post(API_BASE + 'definition', {
					definition: definition
				}).then(function(response){
											// unshift adds to front of array
					defineService.userDefinitions.unshift(response.data);
				});
			};

			defineService.fetch = function(){
				return $http.get(API_BASE + 'definition')
				.then(function(response){
					defineService.userDefinitions = response.data;
				});
			};

			// abbreviation so we can have def = defineService.getDefinitions VS def = defineService.userDefinitions
			defineService.getDefinitions = function(){
				return defineService.userDefinitions;
			};
		}
})();