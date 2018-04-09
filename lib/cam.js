const rtsp = require('rtsp-ffmpeg');

exports.init = function(server, urls){
	const io = require('socket.io')(server);

	var cams = urls.map(function(uri, i) {
		var stream = new rtsp.FFMpeg({input: uri, 
			resolution: '640x480', 
			quality: 3});
		stream.on('start', function() {
			console.log('stream ' + i + ' started');
		});
		stream.on('stop', function() {
			console.log('stream ' + i + ' stopped');
        });
        console.log(stream);
		return stream;
	});

	cams.forEach(function(camStream, i) {
        var ns = io.of('/cam' + i);
        console.log(camStream);
		ns.on('connection', function(wsocket) {
			console.log('connected to /cam' + i);
			var pipeStream = function(data) {
				wsocket.emit('data', data);
			};
			camStream.on('data', pipeStream);
	
			wsocket.on('disconnect', function() {
				console.log('disconnected from /cam' + i);
				camStream.removeListener('data', pipeStream);
			});
		});
	});

	io.on('connection', function(socket) {
		socket.emit('start', urls.length);
	});
	
};