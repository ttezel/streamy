$(function() {

  //  SongView
  var SongView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render', 'play');   //conserve 'this' object
    },
    events: {
      'dblclick': 'play'
    },
    tagName: 'li',
    render: function() {
      $(this.el).html('<span>'+this.model.toJSON().title+'</span>');
      return this;
    },
    play: function() {
      console.log('playing new SONG', this.model.toJSON().title)
      $('span#now-playing').html('Playing: ' + this.model.toJSON().title);

      //stream the requested song
      var player = $('audio#player')[0];
      player.src='stream/'+this.model.toJSON().title;
      player.play();
    }
  });

  //  SongModel
  var SongModel = Backbone.Model.extend({})

  //  Song superobject
  var Song = {
    Model: SongModel
  , View: SongView
  }

  //  LibraryView
  var LibraryView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this, 'render');
      this.collection.bind('add', this.appendItem);
      this.render();
    },
    el: $(' div.library'),
    render: function() {
      $(this.el).append('<ul></ul>');
      //append each model to the ul
      _.each(this.collection.models, function(item){
        this.appendItem(item);
      }, this);
      return this;
    },
    appendItem: function(item){
      var item = new SongView({model: item});
      $('ul', this.el).append(item.render().el);
    }
  });

  //  Library Collection
  var LibraryCollection = Backbone.Collection.extend({
    model: Song.Model
  });

  //  Library superobject
  var Library = {
    Collection: LibraryCollection
  , View: LibraryView
  }

  document.getElementById('socket.io').addEventListener('load', sockListener);

  //  handle song synch
  //  accepts object or string
  function addSongs (songs) {

    function addSong (songTitle) {
      var songModel = new Song.Model({ title: songTitle })
      App.library.add(songModel)
    }

    if(typeof songs === 'object') {
      Object.keys(songs).forEach(function (key) { addSong(key) })
      return
    } else if(typeof songs === 'string') {
      addSong(songs)
    } else {
      throw new Error('song must be of type object or string')
    }
  }

  //grab music library
  function sockListener() {
    window.App = {}

    App.library = new Library.Collection()
    App.libraryView = new Library.View({ collection: App.library })

    //populate library
    socket.on('songs:add', addSongs)
  }
})