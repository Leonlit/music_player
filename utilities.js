function generateList () {
	songArr.forEach((element, index) => {
		const option = document.createElement("option");
		const text = document.createTextNode(element.split(".")[0]);
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

async function getSongs () {
	const result = await
		fetch("./songs_name.txt")
			.then(data=>data.text());
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

function changeCurrentTitle (index, paused=false) {
	const filename = songArr[index].replace(".mp3", "");
	if (!paused) {
		songNow.innerHTML = `Now Playing ---> ${filename}`;
	}else {
		songNow.innerHTML = `Paused ---> ${filename}`;
	}
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