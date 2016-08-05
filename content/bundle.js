(function(){

	var app= angular.module('workoutlog', [
	// dependencies
	'btford.socket-io',
	'ui.router',
	'workoutlog.define',
	'workoutlog.logs',
	'workoutlog.history',
	'workoutlog.feed',
	'workoutlog.auth.signup',
	'workoutlog.auth.signin'
	])
	.factory('socket', function(socketFactory){
		var myIoSocket = io.connect('http://localhost:3000');

		var socket = socketFactory({
			ioSocket: myIoSocket
		});

		return socket;
	});
	// services that are exposed by adding ui-router dependency
	function config($urlRouterProvider){
		// send to define route if not specified
		$urlRouterProvider.otherwise('/signin');
	}
	// what dependencies to inject into application
	// different way of ensuring minification doesn't mess up dependencies
	config.$inject = ['$urlRouterProvider'];
	// takes config function
	app.config(config);
	// setting a global key/value pair
	app.constant('API_BASE', '//localhost:3000/api/');

})();
(function(){
	angular.module('workoutlog.auth.signin', ['ui.router'])
		.config(signinConfig);

	function signinConfig($stateProvider){
		$stateProvider
			.state('signin', {
				url: '/signin',
				templateUrl: '/components/auth/signin.html',
				controller: SignInController,
				controllerAs: 'ctrl',
				bindToController: this
			});
	}
	signinConfig.$inject = [ '$stateProvider' ];

	function SignInController($state, UsersService){
		var vm = this;
		vm.user = {};
		vm.login = function(){
			// communicates to API
			UsersService.login(vm.user)
				.then(function(response){
					$state.go('define');
				});
		};
	}

	SignInController.$inject = [ '$state', 'UsersService'];
})();
(function(){
	angular.module('workoutlog.auth.signup', ['ui.router'])
		.config(signupConfig);

	function signupConfig($stateProvider) {
		$stateProvider
			.state('signup', {
				url: '/signup',
				templateUrl: '/components/auth/signup.html',
				controller: SignUpController,
				controllerAs: 'ctrl',
				bindToController: this
			});
	}
	signupConfig.$inject = [ '$stateProvider' ];	
	
	function SignUpController($state, UsersService){
		// view model
		var vm = this;
		vm.user = {};
		vm.submit = function(){
			UsersService.create(vm.user)
				.then(function(response){
					$state.go('define');
				});
		};
	}

	SignUpController.$inject = [ '$state', 'UsersService' ];
})();
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
(function() {
	angular.module('workoutlog.feed', [ 'ui.router' ])
	.config(feedConfig);

	feedConfig.$inject = [ '$stateProvider' ];

	function feedConfig($stateProvider) {
		$stateProvider
			.state('feed', {
				url: '/feed',
				templateUrl: '/components/feed/feed.html',
				controller: FeedController,
				controllerAs: 'ctrl',
				bindToController: this,
				resolve: {
					getFeed: [
						'FeedService',
						function(FeedService) {
							return FeedService.fetch();
						}
					]
				}
			});
	}

	FeedController.$inject = [ 'socket', 'FeedService', 'CurrentUser' ];
	function FeedController(socket, FeedService, CurrentUser) {
		var vm = this;
		vm.msg = {};
		vm.feed = FeedService.get();

		vm.create = function() {
			vm.msg.username = CurrentUser.get().username;
			socket.emit('chat-message', vm.msg);
			vm.msg.message = '';
		};

		socket.on('new log', function(data) {
			vm.feed.push(data);
		});

		socket.on('chat-message', function(data) {
			vm.feed.push(data);
		});
	}
})();
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
(function() {
	angular.module('workoutlog')
		.factory('AuthInterceptor', 
			[ 'SessionToken', 'API_BASE', 
			function(SessionToken, API_BASE) {
				return {
					request: function(config) {
						var token = SessionToken.get();
						if (token && config.url.indexOf(API_BASE) > -1) {
							config.headers['Authorization'] = token;
						}
						return config;
					}
				};
			}]);

	angular.module('workoutlog')
		.config(['$httpProvider', function($httpProvider) {
			return $httpProvider.interceptors.push('AuthInterceptor');
		}]);
})();
(function() {
	angular.module('workoutlog')
		.service('CurrentUser', [ '$window', function($window) {
			function CurrentUser() {
				var currUser = $window.localStorage.getItem('currentUser');
				if (currUser && currUser !== "undefined") {
					this.currentUser = JSON.parse($window.localStorage.getItem('currentUser'));
				}
			}
			CurrentUser.prototype.set = function(user) {
				this.currentUser = user;
				$window.localStorage.setItem('currentUser', JSON.stringify(user));
			};
			CurrentUser.prototype.get = function() {
				return this.currentUser || {};
			};
			CurrentUser.prototype.clear = function() {
				this.currentUser = undefined;
				$window.localStorage.removeItem('currentUser');
			};
			CurrentUser.prototype.isSignedIn = function() {
				return !!this.get().id;
			};
			return new CurrentUser();
		}]);
})();
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
(function() {
	angular.module('workoutlog')
	.service('FeedService', FeedService);

	FeedService.$inject = [ '$http', 'API_BASE', 'socket' ];
	function FeedService($http, API_BASE, socket) {
		var feedService = this;
		feedService.feed = [];

		feedService.fetch = function() {
			return $http.get(API_BASE + 'feed')
			.then(function(response) {
				feedService.feed = response.data;
			});
		};

		feedService.get = function() {
			return feedService.feed;
		};
	}
})();
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
(function() {
	angular.module('workoutlog')
		.service('SessionToken', [ '$window', function($window) {
			function SessionToken() {
				this.sessionToken = $window.localStorage.getItem('sessionToken');
			}
			SessionToken.prototype.set = function(token) {
				this.sessionToken = token;
				$window.localStorage.setItem('sessionToken', token);
			};
			SessionToken.prototype.get = function() {
				return this.sessionToken;
			};
			SessionToken.prototype.clear = function() {
				this.sessionToken = undefined;
				$window.localStorage.removeItem('sessionToken');
			};
			return new SessionToken();
		}]);
})();
(function(){

	angular.module('workoutlog')
		.service('UsersService', [
			'$http', 'API_BASE', 'SessionToken', 'CurrentUser',
			function($http, API_BASE, SessionToken, CurrentUser){
				function UsersService(){
				}

				UsersService.prototype.create = function(user){
					var userPromise = $http.post(API_BASE + "user", {
						user: user
					});

					userPromise.then(function(response){
						SessionToken.set(response.data.sessionToken);
						CurrentUser.set(response.data.user);
					});
					return userPromise;
				};

				UsersService.prototype.login = function(user){
					var loginPromise = $http.post(API_BASE + 'login', {
						user: user
					});

					loginPromise.then(function(response){
						SessionToken.set(response.data.sessionToken);
						CurrentUser.set(response.data.user);
					});
					return loginPromise;
				};

				return new UsersService();
			}
		]);
})();
//# sourceMappingURL=bundle.js.map
