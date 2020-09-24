# music_player
A simple music player using HTML, CSS and JS.


## Setting up the project

Since this project play songs from the playlist locally on your machine or a list of online song's sources. You'll need to set up your very own playlist for local and  online files.

To setup the project, you'll first need to clone the project to your desired location. After that, put all the song that you would like to use for the player into the ```songs``` folder. Then by using node's package manager, npm, run ```npm run get-files``` in a terminal that's opened from the loction that you cloned the project. All it does is read all the files in the folder. 

After all that, make sure you have ```lite-server``` installed locally or globally on your machine (since I using it to run the project). If not, just run ```npm install``` to install it locally in the project directory. Then lastly, run ```npm start``` to start up the server and a browser will then be opened up. That's all you need to do to start using the web music player.

If you have a list of online songs that could be played directly, you can also make a playlist out of them by adding their titles and links into a file called ```online_songs.txt```. Make sure to use put all of the data in JSON format and wrap everthing inside an array ([]). For example:

```
[
    {"title" : "My_epic_song_name", link: "www.the_link_to_the_song.com/songs/My_epic_song_name.mp3"}
    ...
    ...
    ...
]
```

## Screenshots

### Initial view of the app.

![Initial view of the App](https://github.com/Leonlit/music_player/blob/master/img/snapshot%20-%20main.png?raw=true)

### When the song is playing.

![View of the App when song playing](https://github.com/Leonlit/music_player/blob/master/img/snapshot%20-%20playing.png?raw=true)

## Contact

If you have any question regarding the project, feel free to contact me.

### [leonlit](https://github.com/Leonlit) :

 - [twitter](https://twitter.com/leonlit)
 - [email](leonlit123@gmail.com)
