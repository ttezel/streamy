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
            console.log('rendering ', this.model.toJSON().title);
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
        el: $(' div#library'),
        render: function() {
            $(this.el).append('<ul></ul>');
            _.each(this.collection.models, function(item){   //append each model to the ul
                this.appendItem(item);
            }, this);
            return this;
        },
        appendItem: function(item){
            var item = new SongView({model: item});
            $('ul', this.el).append(item.render().el);
        }
    });

    //refactor this schwag
    document.getElementById('socket.io').addEventListener('load', sockListener);
    
    function sockListener() {
        socket.emit('getMusic');
        socket.on('libLoaded', function(d) {

            window.App = {}; 
            App.library = new Library(d.lib);
            App.libraryView = new LibraryView({collection: App.library});
            
        });
    };
});