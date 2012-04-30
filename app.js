// Module dependencies.

var express = require('express')
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

  //app.use(express.bodyParser());
  //app.use(express.methodOverride());
  //app.use(app.router);
  app.use(express.static(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})

app.songs = {} //for server song-lookup
app.formats = ['.mp3', '.m4a'] //supported formats

//cache music library for socket connections
;(function () {
  var finder = findit.find(__dirname + '/public/music')
  // Populate music library
  finder.on('file', function(fpath, stat) {
    var ext = path.extname(fpath)
    if(app.formats.indexOf(ext) !== -1) {
      var songTitle = path.basename(fpath, ext)
      app.songs[songTitle] = fpath;
    }
  })
  //now listen for socket conn's
  finder.on('end', function () {
    io.sockets.on('connection', function(socket) {
      Object.keys(app.songs).forEach(function (songName) {
        socket.emit('song', { songName: songName })
      })
    })
  })
}).call(this)

// Routes

app.get('/', function(req, res){
  res.render('index.html', {
    locals: {
      title: 'Streamy client'
    }
  })
})

//Serve streaming audio - audio src points here
app.get('/stream/:song', function(req, res) {
  var songPath = app.songs[req.params.song]

  path.exists(songPath, function (exists) {
    if(!exists) {
      var msg = 'File ' + songPath + 'not found :\'{'
      console.log('STREAMY:', msg)
      res.writeHead(404)
      res.end(msg)
      return
    }

    fs.stat(songPath, function (err, stats) {
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': stats.size })
      var readStream = fs.createReadStream(songPath)
      util.pump(readStream, res) //throttle song to client
    })
  })
})

app.listen(3000)
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)