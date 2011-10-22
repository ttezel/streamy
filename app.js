// Module dependencies.

var express = require('express')
    , events = require('events').EventEmitter
    , fs = require('fs')
    , findit = require('findit')
    , path = require('path')
    , util = require('util');

var app = module.exports = express.createServer()
    , io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set("view options", {layout: false});

    //html rendering
    app.register('.html', {
        compile: function(str, options){
            return function(locals){
                return str;
            };
        }
    });
  
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
    res.render('index.html', {
        locals: {
          title: 'Streamy client'
        }
    });
});

//Serve streaming audio - audio src points here

app.get('/stream/:song', function(req, res) {
    var songDetails = app.details[req.params.song]
        , songPath = songDetails.path + '.' + songDetails.ext
        , filePath = path.normalize(songPath)
        , stat = fs.statSync(filePath)
        , readStream = fs.createReadStream(filePath);

    res.writeHead(200, {
        'Content-Type': 'audio/mpeg'
        , 'Content-Length': stat.size
    });

    util.pump(readStream, res); //throttle song to client
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

app.details = {}; //for server song-lookup
app.formats = ['mp3', 'm4a']; //supported formats

// Populate music library

function getLibrary(sock) {
    app.songs = []; //sent to client
    var finder = findit.find(__dirname + '/public/music');

    finder.on('file', function(path, stat) {

        var i = path.length
            , ext = '';

        while(i-- && path[i] != '.') {
            ext = path[i] + ext;  //get file extension
            path = path.substring(0, path.length-1);
        }

        path = path.substring(0, path.length-1);  //remove the '.'

        if(~app.formats.indexOf(ext)) { //make sure file format is supported
            var pathArr = path.split('/');
            app.songs.push({'title': pathArr[pathArr.length-1]});

            var title = pathArr[pathArr.length-1];  //so we can index by title
            app.details[title] = {'path': path, 'ext': ext};
        }
    });
    finder.on('end', function() {
        sock.emit('libLoaded', {lib: app.songs});
    });
};

//Socket.io goodness

io.sockets.on('connection', function(socket) {
    socket.on('getMusic', function() {
        getLibrary(socket);
    });
});
