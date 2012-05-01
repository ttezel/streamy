var MusicLibrary = require('./musiclibrary')

module.exports = SocketServer

function SocketServer (io) {
  var self = this

  this.sockets = []
  this.io = io

  this.musicLibrary = new MusicLibrary()

  //send over songs as they are discovered
  this.musicLibrary.on('songs:add', function (song) {
    self.sockets.forEach(function (socket) {
      socket.emit('songs:add', song)
    })
  })
  this.io.sockets.on('connection', function (socket) {
    self.sockets.push(socket)

    //send over current library
    socket.emit('songs:add', self.musicLibrary.songs)
  })
}