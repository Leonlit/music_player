let bufferLength, source, context, analyser, fArray;
let canvasHeight, canvasWidth, canvas, ctx;
let bars, bar_x, bar_width, wait = false, onlineMode = false;
var playBtn, playList, nowPlaying, options, songNow, intensifies, 
	songTimerRange, timerWidth, onlineSongs, seekingTime=false;

//sample songs [use your own songs]
let songArr = [];

var audio = new Audio();
let currSong = 0;

//on startup, initialise the DOM object variable
window.onload = async function () {
	getSongArr();
	intensifies = 0;
	wait = true;												//make sure the user didn't clicked too fast before the initialisation
	playBtn = document.getElementById("play"),					//The play button
	playBtnText = playBtn.getElementsByTagName("i")[0],
	playList = document.getElementById("playlist");				//the playlist container
	nowPlaying = document.getElementById("nowPlaying");			//the now playing container
	options = playList.getElementsByTagName("option");			//The options tag inside the playlist container
	songNow = document.getElementById("songNow");				//the song name container (the one that keeps on floating to the left)
	songTimerRange = document.getElementById("currDuration");	//The input type range for the current time of the song (Following the range width)
	timerWidth = songTimerRange.offsetWidth;					//getting the width of the songTimerRange element
}

function useFileSource () {
	if (onlineMode || onlineSongs) {
		return `http://cors-anywhere.herokuapp.com/${songArr[currSong].link}`;
	}else {
		return `songs/${songArr[currSong]}`
	}
}

//when the play button is clicked
function start (url) {
	//if the current status is not waiting
	if (!wait) {
		//changing the play button text to pause as well as changing the function
		//to be triggered to trigger pauseSong on the next button click
		playBtnText.innerHTML = "&#xf04c;";
		playBtn.onclick = pauseSong;
		let audioSource;
		//specifying the source for the audio element
		if (url === undefined) {
			audioSource = useFileSource();
		}else {
			audioSource = url;
		}
		changeSource(audioSource);
		audio.crossOrigin = "anonymous";
	
		context = new (window.AudioContext || window.webkitAudioContext)();		//creating an audio context 
		analyser = context.createAnalyser();								//creating a analyzer for the context
		const size = window.screen.width > 900 ? 512 : 256
		console.log(size);
		analyser.fftSize = size;												//setting the window size in samples
		source = context.createMediaElementSource(audio);						//creating a new MediaElementAudioSourceNode using our audio object
		source.connect(analyser);												//using the node source we created just now, conect it with the analyzer
		analyser.connect(context.destination);									//Then connect the analyzer with the context's destination
		bufferLength = analyser.frequencyBinCount;								//getting the number of values that the program need to draw out
		fArray = new Uint8Array(bufferLength);									//representing the array as a unsigned 8-bit integers

		canvas = document.getElementById("analyser_render");					//getting the canvas
		ctx = canvas.getContext('2d');											//getting the canvas context
		resize();																//resizing the canvas to properly size the drawing location
		canvasHeight = canvas.height;							
		canvasWidth = canvas.width;
		bar_width = canvasWidth / bufferLength

		//when a song is finished, go to the next song
		audio.addEventListener("ended", function(){
			onlineSongs = false;
			nextSong();
			playSong();
		});
		
		changeCurrentTitle(currSong);											//change the title at the currently playing container
		audio.play();															//play out the song
		customizeSongRange(audio.duration);										//setting the max value for the range of the song
		frameLooper();															//start the animation frame (looping)
	}
}


//function for playing a song
function playSong () {
	wait = false;
	//if the source is empty call the start function (the system has not yet initialize some important values)
	if (audio.src === "") {
		start();
	}else{
		playBtnText.innerHTML = "&#xf04c;";						//changing the stop text button into a pause text button
		playBtn.onclick = pauseSong;					//pause the song
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		window.cancelAnimationFrame(frameLooper)
		changeSource(useFileSource());
		audio.play();
		changeCurrentTitle(currSong, false);
		customizeSongRange(audio.duration);
		frameLooper();
	}
}

const restartSong = () => setSongTime(0);

function nextSong () {
	focusList(currSong, currSong + 1)
	currSong = currSong + 1;
	if(currSong == songArr.length) {
		currSong = 0;
	}
}

function prevSong () {
	focusList(currSong, currSong - 1);
	currSong = currSong - 1;
	if(currSong < 0) {
		currSong = songArr.length - 1;
	}
}

function pauseSong () {
	if (!wait) {
		audio.pause();
		changeCurrentTitle(currSong, true);
		playBtnText.innerHTML = "&#xf04b;";
		playBtn.onclick = resumeSong;
	}
}
function resumeSong () {
	if (!wait) {
		audio.play();
		changeCurrentTitle(currSong, false);
		playBtnText.innerHTML = "&#xf04c;";
		playBtn.onclick = pauseSong;
	}
}

function skipSong () {
	if (!wait) {
		pauseSong();
		nextSong();
		wait = true;
		setTimeout(() => {
			playSong();
		}, 1500);
	}
}

function backSong () {
	if (!wait) {
		pauseSong();
		prevSong();
		wait = true;
		setTimeout(() => {
			playSong();
		}, 1500);
	}
}

function playFromList () {
	const curr = parseInt(playList.value);
	focusList(currSong, curr);
	currSong = curr;
	pauseSong();
	wait = true
	setTimeout(() => {
		playSong();
	}, 1500);
}

const divider = window.screen.width < 1180? 2 : 1;
function frameLooper(){
	analyser.getByteFrequencyData(fArray);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	const multiplier = window.screen.width < 1180 ? 0.0000425 : 0.0000225;
	ctx.fillStyle = "rgba(255, 255, 255, " + (intensifies * multiplier - 0.4) + ")";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	intensifies = 0;
	fArray.forEach((feq, index) => {
		bar_x = index * bar_width;
		const bar_height = feq/ 255 * canvasHeight/2 * 1.2 / divider;
		ctx.fillStyle = freqColor(bar_height);
		intensifies += feq;
		ctx.fillRect(bar_x, canvasHeight - bar_height, bar_width, bar_height);
	});
	window.requestAnimationFrame(frameLooper);
	window.requestAnimationFrame(followSongTime);
}

function playFromUrl () {
	onlineSongs = true;
	const url = getUrl();
	if (audio.src === "") {
		start(url);
	}else if (url !== null){
		pauseSong();
		changeSource(url);
		currSong -= 2;
		changeCurrentTitle();
		showMore();
		setTimeout(() => {
			resumeSong();
		}, 1500);
	}
}
