//Generating the playlist
function generateList () {
	//saving the label for the playlist
	const label = playList.getElementsByTagName("option")[0];
	//clearing the contents of the playlist
	playList.innerHTML = "";
	//appending back the label into the playlist container
	playList.appendChild(label);
	//generating the elements base on the array of element 
	songArr.forEach((element, index) => {
		const option = document.createElement("option");
		let text = document.createTextNode(element.title);
		//appending the text to the option element
		option.appendChild(text);
		//as well as setting the value of the element with the index accordingly
		option.setAttribute("value", index);
		//set the current element's attribute to active if it's the current song that's to be played
		if (index == currSong) {
			option.selected = true;
		}
		//finally append the option element into the playlist
		playList.appendChild(option);
	});
	wait = false;
}

//getting the songs array for the system
async function getSongArr () {
	//getting the arrays of songs
	const arr = await getSongs();
	if (arr !== null) {				//getting the String containing the sosngs from the function getsongs
		songArr = arr;
		generateList();
	}
}

//reading data from the files
async function getSongs () {
	//file for the local song's filename
	let filename = "./songs_name.txt";
	//but if the onlineMode is on, it means that the user choose to play online songs
	if (onlineMode) {
		//change the filename to online_songs.txt 
		filename = "./online_songs.txt"
	}
	//wait for the data retrieving to complete 
	let result = await
		fetch(filename)
			.then(response=> {
				if (response.status >= 200 && response.status <= 299) {
					return response.text();
				}else {
					throw new Error();
				}
			}).catch(err => {
				showError(`File: ${filename} not found in directory!!!`);
			});
	//if the file contains nothing return null.
	if (result == "") {
		return null
	}
	return JSON.parse(result);
}

//change focus of the playlist active element
function focusList (from, to) {
    if (to < 0) {
        to = songArr.length + to;
    }else if (to == songArr.length) {
        to = 0;
	}
	if (from != null) {
		changeCurrentTitle(to);
		options[from + 1].selected = false;
		options[to + 1].selected = true;
	}else {
		options[to + 1].selected = true;
	}
}

//changing the volume for the song
const changeVolume = (amount) => audio.volume = round(amount, 1);

//change the current title for the song (base on paused or currently playing)
function changeCurrentTitle (index=null, paused=false) {
	let filename;
	if (!onlineSongs && !onlineMode) {
		//since the name also has the mp3 or other extension in it, we need to remove that extension
		filename = songArr[index].title;
	}else {
		//else just use the title from the getTitle() function
		filename = getTitle();
	}
	songNow.style.width = `${filename.length * 14}px`
	//message show when the song is playing
	if (!paused) {
		songNow.innerHTML = `Now Playing ---> ${filename}`;
	}else {		//while this message is when the song is paused.
		songNow.innerHTML = `Paused ---> ${filename}`;
	}
}

//getting the tittle for the song
function getTitle () {
	//extra feature input for songs title
	const title = document.getElementById("songTitle").value;
	//if there's no title given from the extra feature, means that it's name is either in the
	//JSON data or the user didn't provide one in the text file.
	if (title == "") {
		if (songArr[currSong].title === undefined) {
			//if user didn't specify which title to be used, give the container "No Title" as a 
			//placeholder
			return "No Title";
		}else {
			//returning the current song title from the JSON object
			return songArr[currSong].title;
		}
	}
	return title;
}

//gete the url from the extra feacture url field
function getUrl () {
	const url = document.getElementById("fromUrl").value;
	if (url == "") return null;
	return url;
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

//for resizing the canvas according to the window size
function resize () {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

//setting the current time for the song
function setSongTime (time) {
	audio.currentTime = time;
}

//making it so that the song current value's range can always be followed by the thumb
function followSongTime () {
	if (!seekingTime) {
		const newValue = audio.currentTime / audio.duration * timerWidth ;
		songTimerRange.value = newValue;
	}
}

//set the time user choosed from the range element
function setSongFollowingTime() {
	const newTime = songTimerRange.value /timerWidth * audio.duration;
	audio.currentTime = newTime;
}

//changing the max value for the song current's time range element
function customizeSongRange () {
	songTimerRange.setAttribute("max", `${timerWidth}`);
}

//setting up how the music player get the audio source.
//Online or offline
function getFileSource () {
	let file;
	if (onlineMode || onlineSongs) {
		file = `http://cors-anywhere.herokuapp.com/${songArr[currSong].link}`;
	}else {
		file = `songs/${songArr[currSong].source}`;	
	}
	return file;
}

//changing the audio source
async function changeSource (newSource) {
	try {
		const stats = await fileExists(newSource);
		console.log(stats);
		if (stats) {
			audio.src= newSource;
			return true;
		}else {
			throw new Error();
		}
	}catch {
		showError(`Unable to play Song. Song's source not found for ${newSource}`);
		return false;
	}
}

//change mode from local to online mode
const modeIcon = document.getElementById("changeMode");
async function changeMode () {
	pauseSong();
	if (onlineMode) {
		modeIcon.style.color = "white";
		onlineMode = false;
	}else {
		modeIcon.style.color = "yellow";
		onlineMode = true;
	}
	await getSongArr();
	//incase the index is bigger than the song array for local songs, change index 
	//to the last song in the local directory
	if (currSong >= songArr.length) {
		currSong = songArr.length - 1;
	}
	focusList(null, currSong)
	changeCurrentTitle(currSong, false);
	playSong();
}


function configureBackground() {
	const bgImageCont = document.getElementById("bgImageContainer");
    let clone = bgImageCont.cloneNode(true);
	bgImageCont.parentNode.replaceChild(clone, bgImageCont);

	clone.classList = "fadeOut";
	clone.addEventListener("animationend", ()=>{
		clone.classList = "fadeIn";
		clone.addEventListener("animationstart", ()=>{
			clone.style.backgroundImage = `url(${songArr[currSong].bgImg})`;
		}, false);
	}, false);
}

function attachColourStop (grd) {
	grd.addColorStop(0, songArr[currSong].colour.firstStop);
	grd.addColorStop(1, songArr[currSong].colour.secondStop);
	return grd;
}
