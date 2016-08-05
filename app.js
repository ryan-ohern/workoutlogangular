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