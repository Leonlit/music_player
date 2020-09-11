var canvas, ctx, source, context, analyser, fArray, bars, bar_x, bar_width;
var songArr = ["Nightcore - The Phoenix.mp3","Nightcore_Take_A_Hint.mp3","Nightstep_Human.mp3","Nightcore -  Demons.mp3","Nightcore - Who You Are.mp3"]
var currSong = 0;

let canvasHeight, canvasWidth, bufferLength;

var audio = new Audio();
audio.src = songArr[currSong];

function play() {
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
	bar_width = canvasWidth / bufferLength;
	audio.play();
	frameLooper();
	audio.addEventListener("ended", function(){

		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		window.cancelAnimationFrame(frameLooper)
		currSong = currSong + 1;
		if(currSong >(songArr.length)) {
			currSong = 0;
		}
		audio.src = songArr[currSong];
		console.log("playing ${songArr[currSong]}");
		audio.play();
		frameLooper();
	});
}

function changeVolume(amount) {
	audio.volume = round(amount, 1);
}

function frameLooper(){
	analyser.getByteFrequencyData(fArray);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	fArray.forEach((feq, index) => {
		bar_x = index * bar_width;
		const bar_height = feq/ 255 * canvasHeight;
    	ctx.fillStyle = freqColor(bar_height)
		ctx.fillRect(bar_x, canvasHeight - bar_height, bar_width, bar_height);
	});
  window.requestAnimationFrame(frameLooper);
}

function freqColor (frequency) {
  return `hsl(${frequency/canvasHeight * 255 + 100}, 100%, 50%)`;
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function resize () {
	canvas.width = canvas.clientWidth * window.devicePixelRatio;
	canvas.height = canvas.clientHeight * window.devicePixelRatio;
}