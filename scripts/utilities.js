function generateList () {
	const label = playList.getElementsByTagName("option")[0];
	playList.innerHTML = "";
	playList.appendChild(label);
	songArr.forEach((element, index) => {
		const option = document.createElement("option");
		let text;
		if (!onlineMode) {
			text = document.createTextNode(element.split(".")[0]);
		}else {
			text = document.createTextNode(element.title);
		}
		option.appendChild(text);
		option.setAttribute("value", index);
		//option.setAttribute
		if (index == currSong) {
			option.selected = true;
		}
		playList.appendChild(option);
	});
	wait = false;
}

async function getSongArr () {
	const arr = await getSongs();
	if (!onlineMode) {				//getting the String containing the sosngs from the function getsongs
		songArr = arr.split(",");	//Splitting the values while using comma as the delimiter
	}else {
		songArr = arr;
	}
	generateList();
}

async function getSongs () {
	let filename = "./songs_name.txt";
	if (onlineMode) {
		filename = "./sample_song.txt"
	}
	let result = await
		fetch(filename)
			.then(data=>data.text());
	if (onlineMode) {
		result = JSON.parse(result);
	}
	return result;
}

function focusList (from, to) {
    if (to < 0) {
        to = songArr.length + to;
    }else if (to == songArr.length) {
        to = 0;
    }
    changeCurrentTitle(to);
	options[from + 1].selected = false;
	options[to + 1].selected = true;
}

const freqColor = (frequency) => `hsl(${frequency/canvasHeight * 255 * 2 + 100}, 100%, 50%)`;

const changeVolume = (amount) => audio.volume = round(amount, 1);

function changeCurrentTitle (index=null, paused=false) {
	let filename;
	if (!onlineSongs && !onlineMode) {
		filename = songArr[index].replace(".mp3", "");
	}else {
		filename = getTitle();
	}
	if (!paused) {
		songNow.innerHTML = `Now Playing ---> ${filename}`;
	}else {
		songNow.innerHTML = `Paused ---> ${filename}`;
	}
}

function getTitle () {
	const title = document.getElementById("songTitle").value;
	if (title == "") {
		if (songArr[currSong].title === undefined) {
			return "No Title";
		}else {
			console.log(songArr[currSong].title);
			return songArr[currSong].title;
		}
	}
	return title;
}

function getUrl () {
	const url = document.getElementById("fromUrl").value;
	if (url == "") return null;
	return url;
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function resize () {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

function setSongTime (time) {
	audio.currentTime = time;
}

function followSongTime () {
	const newValue = audio.currentTime / audio.duration * timerWidth ;
	songTimerRange.value = newValue;
}

function customizeSongRange () {
	songTimerRange.setAttribute("max", `${timerWidth}`);
}

function changeSource (newSource) {
	audio.src= newSource;
}

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
	changeCurrentTitle(currSong, false);
	playSong();
}