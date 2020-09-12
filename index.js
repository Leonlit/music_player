let bufferLength, source, context, analyser, fArray;
let canvasHeight, canvasWidth, canvas, ctx;
let bars, bar_x, bar_width, wait = false;
var playBtn, playList, nowPlaying;

//sample songs [use your own songs]
const songArr = [
	"Nightcore - The Phoenix.mp3","Nightcore_Take_A_Hint.mp3","Nightstep_Human.mp3",
	"Nightcore -  Demons.mp3","Nightcore - Who You Are.mp3", "Flower_Dance.mp3"
];

let audio = new Audio();
let currSong = 0;

window.onload = () => {
	setTimeout(() => {
		initiate();
	}, 1000);
}

function initiate() {
	playBtn = document.getElementById("play"),
	playList = document.getElementById("playlist");
	nowPlaying = document.getElementById("nowPlaying");
	generateList();
}

function start () {
	playBtn.innerHTML = "Pause";
	playBtn.onclick = pauseSong;
	audio.src = songArr[currSong];
	audio.autoplay = true;
	context = new (window.AudioContext || window.webkitAudioContext)();
	analyser = context.createAnalyser();
	analyser.fftSize = 1024;
	canvas = document.getElementById("analyser_render");
	ctx = canvas.getContext('2d');
	resize();
	canvasHeight = canvas.height;
	canvasWidth = canvas.width;
	source = context.createMediaElementSource(audio);
	source.connect(analyser);
	analyser.connect(context.destination);
	bufferLength = analyser.frequencyBinCount;
	fArray = new Uint8Array(bufferLength);
	bar_width = canvasWidth / bufferLength * 1.2;
	audio.addEventListener("ended", function(){
		nextSong();
		playSong();
	});

	changeCurrentTitle();
	audio.play();
	frameLooper();
}

function playSong () {
	wait = false;
	if (audio.src === "") {
		start();
	}else {
		playBtn.innerHTML = "Pause";
		playBtn.onclick = pauseSong;
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		window.cancelAnimationFrame(frameLooper)
		audio.src = songArr[currSong];
		console.log(`playing ${songArr[currSong]}`);
		changeCurrentTitle();
		audio.play();
		frameLooper();
	}
}

function nextSong () {
	currSong = currSong + 1;
	if(currSong == songArr.length) {
		currSong = 0;
	}
}

function prevSong () {
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
const restartSong = () => audio.currentTime = 0;

function skipSong () {
	pauseSong();
	nextSong();
	changeCurrentTitle();
	wait = true;
	setTimeout(() => {
		playSong();
	}, 1500);
}

function backSong () {
	pauseSong();
	prevSong();
	changeCurrentTitle();
	wait = true;
	setTimeout(() => {
		playSong();
	}, 1500);
}

function changeCurrentTitle () {
	console.log(songArr[currSong]);
	nowPlaying.innerHTML = songArr[currSong].replace(".mp3", "");
}

function playFromList () {
	console.log(audio.src);
	currSong = parseInt(playList.value);
	pauseSong();
	changeCurrentTitle();
	wait = true
	setTimeout(() => {
		playSong();
	}, 1500);
}

const changeVolume = (amount) => audio.volume = round(amount, 1);

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

const freqColor = (frequency) => `hsl(${frequency/canvasHeight * 255 * 2 + 100}, 100%, 50%)`;

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function resize () {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

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
}