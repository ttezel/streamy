$(function() {   
     
  /**
          Models
  **/
  window.Song = Backbone.Model.extend({});

  /**
          Collections
  **/
  window.Library = Backbone.Collection.extend({
    model: Song
  });

  /**
          Views
  **/
  window.SongView = Backbone.View.extend({
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
       $('span#now-playing').html('Playing: ' + this.model.toJSON().title);

      //stream the requested song
      var player = $('audio#player')[0];
      player.src='stream/'+this.model.toJSON().title;
      player.play();
    }
  });

  window.LibraryView = Backbone.View.extend({
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

  document.getElementById('socket.io').addEventListener('load', sockListener);

  //grab music library
  function sockListener() {
    window.App = {}
    App.library = new Library()
    App.libraryView = new LibraryView({ collection: App.library })

    //add songs to library Collection as they come in
    socket.on('song', function (d) {
      var song = new Song({ title: d.songName })
      App.library.add(song)
    })
    socket.emit('getMusic')
  }
})