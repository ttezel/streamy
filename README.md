##Streaming Audio with node.js

`Streamy` is a streaming audio server, with a web client. You can listen to music from your browser.

Currently supports **mp3** and **m4a**.

###Usage:

Clone the repo:

	git clone git@github.com:ttezel/streamy.git
	
Install npm dependencies:

	cd streamy
	npm install
	
Run the audio server:
	
	node app.js
	
###Web Client

Once the audio server is running, go to `127.0.0.1:3000` in your browser.

You will see a list of all your music files that were placed in `<streamy-directory>/public/music/`. There is a song there as an example. Double click a song to stream it.

All music files in `public/music/` will be streamable.

Don't want to copy/paste your entire music library into `public/music/` ? S'all good. Just create a symlink to your music library as such:

	cd public/music
	ln -s /home/ttezel/Desktop/MUSIC/ music_library
	
This creates a symlink named `music_library` that points to `/home/ttezel/Desktop/MUSIC/`. Streamy will traverse your symlink and retrieve the music files, thanks to [node-findit](https://github.com/substack/node-findit).

###Streaming Individual Songs

Endpoint: `127.0.0.1:3000/stream/SONGNAME` to stream individual songs.

