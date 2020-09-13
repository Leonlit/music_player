let bufferLength, source, context, analyser, fArray;
let canvasHeight, canvasWidth, canvas, ctx;
let bars, bar_x, bar_width, wait = false;
var playBtn, playList, nowPlaying, options, songNow;

//sample songs [use your own songs]
let songArr = [];

//getting the list of songs available
getSongs().then(arr=>{
	songArr = arr.split(",");
});

let audio = new Audio();
let currSong = 0;

window.onload = () => {
	setTimeout(() => {
		initiate();
	}, 1000);
}

function initiate() {
	wait = true;
	playBtn = document.getElementById("play"),
	playList = document.getElementById("playlist");
	nowPlaying = document.getElementById("nowPlaying");
	options = playList.getElementsByTagName("option");
	songNow = document.getElementById("songNow");
	generateList();
}

function start () {
	if (!wait) {
		playBtn.innerHTML = "Pause";
		playBtn.onclick = pauseSong;

		audio.src = `songs/${songArr[currSong]}`;
		audio.autoplay = true;

		context = new (window.AudioContext || window.webkitAudioContext)();
		analyser = context.createAnalyser();
		analyser.fftSize = 1024;
		source = context.createMediaElementSource(audio);
		source.connect(analyser);
		analyser.connect(context.destination);
		bufferLength = analyser.frequencyBinCount;
		fArray = new Uint8Array(bufferLength);

		canvas = document.getElementById("analyser_render");
		ctx = canvas.getContext('2d');
		resize();
		canvasHeight = canvas.height;
		canvasWidth = canvas.width;
		bar_width = canvasWidth / bufferLength * 1.2;

		audio.addEventListener("ended", function(){
			nextSong();
			playSong();
		});

		changeCurrentTitle(currSong);
		audio.play();
		frameLooper();
	}
}

function playSong () {
	wait = false;
	if (audio.src === "") {
		start();
	}else{
		playBtn.innerHTML = "Pause";
		playBtn.onclick = pauseSong;
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		window.cancelAnimationFrame(frameLooper)
		audio.src = `songs/${songArr[currSong]}`;
		audio.play();
		frameLooper();
	}
}

const restartSong = () => audio.currentTime = 0;

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
		playBtn.innerHTML = "Resume";
		playBtn.onclick = resumeSong;
	}
}
const resumeSong = () => {
	if (!wait) {
		audio.play();
		playBtn.innerHTML = "Pause";
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
}