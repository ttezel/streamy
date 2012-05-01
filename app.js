// Module dependencies

var fs = require('fs')
  , path = require('path')
  , util = require('util')

  , MusicLibrary = require('./musiclibrary')
  , SocketServer = require('./socket-server')

  , express = require('express')

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
  app.use(express.static(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})

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
  var songPath = socketServer.musicLibrary.songs[req.params.song]

  path.exists(songPath, function (exists) {
    if(!exists) {
      var msg = 'File `' + songPath + '` not found'
      console.log('\nSTREAMY:', msg)
      res.writeHead(404)
      res.end(msg)
      return
    }

    //stream song to client
    fs.stat(songPath, function (err, stats) {
      if(err) {
        console.log('\nSTREAMY: stat\'ing error:', err)
        res.writeHead(500)
        return
      }

      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': stats.size })
      var readStream = fs.createReadStream(songPath)

      util.pump(readStream, res) //pump song to client
    })
  })
})

var PORT = 3000

app.listen(PORT)
console.log("STREAMY: listening on port", PORT)

var socketServer = new SocketServer(io)