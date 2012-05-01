var EventEmitter = require('events').EventEmitter
  , path = require('path')
  , util = require('util')

  , findit = require('findit')

var FORMATS = ['.mp3', '.m4a'] //supported formats

module.exports = MusicLibrary

//
//  opts has these optional keys
//    #root: relative directory to serve [defaults to ./public/music]
//
function MusicLibrary (opts) {
  EventEmitter.call(this)

  if(!opts) opts = {}
  else if(typeof opts !== 'object') throw new Error('MusicLibrary opts must be of type object')

  this.opts = opts
  this.songs = {}
  this.populate()
}

util.inherits(MusicLibrary, EventEmitter)

MusicLibrary.prototype.populate = function () {
  var self = this

  this.root = this.opts.root || path.join(__dirname, '/public/music')

  finder = findit.find(this.root)
  
  //  cache music library for socket connections
  finder.on('file', function(fpath, stat) {
    var ext = path.extname(fpath)
    if(FORMATS.indexOf(ext) !== -1 && stat.size) {
      var songTitle = path.basename(fpath, ext)
      self.songs[songTitle] = fpath;
      self.emit('songs:add', { songTitle: songTitle, fpath: fpath })
    }
  })
  finder.on('end', function () {
    self.emit('ready')
  })
}