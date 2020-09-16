let bufferLength, source, context, analyser, fArray;
let canvasHeight, canvasWidth, canvas, ctx;
let bars, bar_x, bar_width, wait = false;
var playBtn, playList, nowPlaying, options, songNow, songTimerRange, timerWidth;

//sample songs [use your own songs]
let songArr = [];

var audio = new Audio();
let currSong = 0;

//on startup, initialise the DOM object variable
window.onload = async function () {
	const arr = await getSongs();								//getting the String containing the sosngs from the function getsongs
	songArr.push(...arr.split(","));									//Splitting the values while using comma as the delimiter
	wait = true;												//make sure the user didn't clicked too fast before the initialisation
	playBtn = document.getElementById("play"),					//The play button
	playBtnText = playBtn.getElementsByTagName("i")[0],
	playList = document.getElementById("playlist");				//the playlist container
	nowPlaying = document.getElementById("nowPlaying");			//the now playing container
	options = playList.getElementsByTagName("option");			//The options tag inside the playlist container
	songNow = document.getElementById("songNow");				//the song name container (the one that keeps on floating to the left)
	songTimerRange = document.getElementById("currDuration");	//The input type range for the current time of the song (Following the range width)
	timerWidth = songTimerRange.offsetWidth;					//getting the width of the songTimerRange element
	generateList();
	
}

//when the play button is clicked
function start () {
	//if the current status is not waiting
	if (!wait) {
		//changing the play button text to pause as well as changing the function
		//to be triggered to trigger pauseSong on the next button click
		playBtnText.innerHTML = "&#xf04c;";
		playBtn.onclick = pauseSong;

		//specifying the source for the audio element
		audio.src = `songs/${songArr[currSong]}`;

	
		context = new (window.AudioContext || window.webkitAudioContext)();		//creating an audio context 
		analyser = context.createAnalyser();									//creating a analyzer for the context
		analyser.fftSize = 1024;												//setting the window size in samples
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
		bar_width = canvasWidth / bufferLength * 1.2;

		//when a song is finished, go to the next song
		audio.addEventListener("ended", function(){
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
		playBtn.onclick = pauseSong;						//pause the song
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		window.cancelAnimationFrame(frameLooper)
		window.cancelAnimationFrame(followSongTime);
		audio.src = `songs/${songArr[currSong]}`;
		audio.play();
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

const pauseSong = () => {
	if (!wait) {
		audio.pause();
		changeCurrentTitle(currSong, true);
		playBtnText.innerHTML = "&#xf04b;";
		playBtn.onclick = resumeSong;
	}
}
const resumeSong = () => {
	if (!wait) {
		audio.play();
		changeCurrentTitle(currSong);
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

function frameLooper(){
	analyser.getByteFrequencyData(fArray);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	fArray.forEach((feq, index) => {
		bar_x = index * bar_width;
		const bar_height = feq/ 255 * canvasHeight/2 * 1.2;
    	ctx.fillStyle = freqColor(bar_height)
		ctx.fillRect(bar_x, canvasHeight - bar_height, bar_width, bar_height);
	});
  window.requestAnimationFrame(frameLooper);
  window.requestAnimationFrame(followSongTime);
}

function showMore () {
	
}

function playFromUrl () {
	const fromUrl = document.getElementById("fromUrl").value;
	console.log(fromUrl);
	audio.src=fromUrl;
}