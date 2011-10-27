##Streaming Audio with node.js

###Usage:

	npm install
	node app.js

If you head to **127.0.0.1:3000/** you will see a list of all your music files that were placed in **public/music/**. There is a song there as an example. Double click a song to stream it.

Note: you can place as many nested folders you want in **public/music/** and your music files will all be found. Currently supports **mp3** and **m4a**.

Don't want to copy/paste your entire music library into **public/music/** ? S'all good. Just create a symlink to your music library as such:

	cd public/music
	ln -s /home/ttezel/Desktop/MUSIC/ music_library
	
This creates a symlink named **music_library** that points to **/home/ttezel/Desktop/MUSIC/**. Streamy will traverse your symlink and retrieve the music files.

If you go to **127.0.0.1:3000/stream/SONGNAME** you can stream individual songs.
