(function() {
	var socketSource = document.createElement('script');
	socketSource.src = '/socket.io/socket.io.js';
	socketSource.id = 'socket.io';
	document.head.appendChild(socketSource);
	socketSource.addEventListener('load', function() {
		window.socket = io.connect(window.location.hostname, {port: 3000, rememberTransport: false});
		socket.on('connect', function() {
			console.log('socket client connected');
		});
	});
}).call(this);
