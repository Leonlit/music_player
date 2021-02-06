var bufferLength, source, context, analyser, fArray;
var canvasHeight, canvasWidth, canvas, ctx;
var bars, bar_x, bar_width, wait = false, onlineMode = false;
var playBtn, playList, options, songNow, intensifies, 
	songTimerRange, timerWidth, onlineSongs, seekingTime = false;

//sample songs [use your own songs by putting the files in a folder]
//called songs and then run node ./getFiles.js in your terminal at the 
//project's root directory
let songArr = [];

let audio = new Audio();
let currSong = 0;

//on startup, initialise the DOM object variable
window.onload = async function () {
	getSongArr();
	intensifies = 0;
	wait = true;												//make sure the user didn't clicked too fast before the initialisation
	playBtn = document.getElementById("play"),					//The play button
	playBtnText = playBtn.getElementsByTagName("i")[0],
	playList = document.getElementById("playlist");				//the playlist container
	options = playList.getElementsByTagName("option");			//The options tag inside the playlist container
	songNow = document.getElementById("songNow");				//the song name container (the one that keeps on floating to the left)
	songTimerRange = document.getElementById("currDuration");	//The input type range for the current time of the song (Following the range width)
	timerWidth = songTimerRange.offsetWidth;					//getting the width of the songTimerRange element
}

//when the play button is clicked
async function start (url) {
	//if the current status is not waiting
	if (!wait) {
		let audioSource;
		//specifying the source for the audio element
		if (url === undefined) {
			audioSource = getFileSource();
		}else {
			audioSource = url;
		}
		const stats = await changeSource(audioSource);
		if (stats) {
			//changing the play button text to pause as well as changing the function
			//to be triggered to trigger pauseSong on the next button click
			playBtnText.innerHTML = "&#xf04c;";
			playBtn.onclick = pauseSong;

			audio.crossOrigin = "anonymous";
		
			context = new (window.AudioContext || window.webkitAudioContext)();		//creating an audio context 
			analyser = context.createAnalyser();									//creating a analyzer for the context
			const size = window.screen.width > 900 ? 256 : 128						//determine which size to use for the frequencies discrete value
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
			//also change song when playing the first song
			changeCurrentTitle(currSong, false);											//change the title at the currently playing container
			configureBackground();
			audio.play();															//play out the song
			customizeSongRange(audio.duration);										//setting the max value for the range of the song
			frameLooper();															//start the animation frame (looping)
		}
	}
}


//function for playing a song
async function playSong () {
	wait = false;
	//if the source is empty call the start function (the system has not yet initialize some important values)
	if (audio.src === "") {
		start();
	}else{
		configureBackground();
		playBtnText.innerHTML = "&#xf04c;";					//changing the stop text button into a pause text button
		playBtn.onclick = pauseSong;						//pause the song
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);		
		window.cancelAnimationFrame(frameLooper)			//canceling the frame looper
		const stats = await changeSource(getFileSource());		//change the source for the audio
		if (stats) {
			audio.play();										//changing title of the song and playing the song
			changeCurrentTitle(currSong, false);
			customizeSongRange(audio.duration);					//As well as reconfigure the size of the range placeholder of the song
			frameLooper();										//start baak the frame looper
		}
	}
}

//resetting the current time of the song to 0
const restartSong = () => setSongTime(0);

//Increasing the index of the song to be played by one
function nextSong () {
	//change the active option tag in the playlist to a new one
	focusList(currSong, currSong + 1)
	currSong = currSong + 1;
	//if the value is equal to the array length (exceeded the array),
	// loop back the index to the first element in the array (index 0)
	if(currSong == songArr.length) {
		currSong = 0;
	}
}

//decresing the index of the song to be played by one
function prevSong () {
	//change the active option tag in the playlist to a new one
	focusList(currSong, currSong - 1);
	currSong = currSong - 1;
	//if the value is less than 0, loop back the index to the last element 
	//in the array
	if(currSong < 0) {
		currSong = songArr.length - 1;
	}
}

//pause the current song
function pauseSong () {
	//if the system status is not waiting, proceed with pausing the song
	if (!wait) {
		audio.pause();
		//change the title so that user know the song is now paused
		changeCurrentTitle(currSong, true);
		//changing the icon for the play button to a play icon
		//and changing the triggered function when onclick event fired
		playBtnText.innerHTML = "&#xf04b;";
		playBtn.onclick = resumeSong;
	}
}

//after pausing the song, user can resume the song
function resumeSong () {
	//but the system can't be at waiting status during this operation
	if (!wait) {
		audio.play();
		//notify the user the song is currently playing
		changeCurrentTitle(currSong, false);
		//Changing the icon of the play button to a pause icon
		//and of course changing the function triggered when onclick event is fired
		playBtnText.innerHTML = "&#xf04c;";
		playBtn.onclick = pauseSong;
	}
}

//skipping forward the current song to the next song
function skipSong () {
	//make sure the system is not in waiting status
	if (!wait) {
		//pause the song first, then increase the index of the song by one
		pauseSong();
		nextSong();
		//then set the system to be in waiting status
		wait = true;
		//after a delay of 1.5 second, play the song
		setTimeout(() => {
			playSong();
		}, 1500);
	}
}

//skipping the song to the previous song
function backSong () {
	if (!wait) {
		//pause the song
		pauseSong();
		//change the song index decrease by one
		prevSong();
		//changing the system status to waiting stats
		wait = true;
		//play the song after 1.5 seconds 
		setTimeout(() => {
			playSong();
		}, 1500);
	}
}

//play song from the list (when clicked from the playlist)
function playFromList () {
	//changing the value from string to integer
	const curr = parseInt(playList.value);
	//change the active option's element in the playlist
	focusList(currSong, curr);
	//change the song index to the clicked elements index
	currSong = curr;
	//pausing the song as well as changing the system into waiting stats
	pauseSong();
	wait = true
	//play the song after 1.5 seconds
	setTimeout(() => {
		playSong();
	}, 1500);
}

//since in phone the width of the screen is smaller, we need to make 
//the frequency bar to be smaller 
//setting the divider base on the screen width
const divider = window.screen.width < 1180? 2 : 1;
//setting the multiplier so that we can make the flashing effects when 
//there's a high notes being played. Smaller screen need higher frequency 
//for the flash effect to happen because we've make their value halved.
const multiplier = window.screen.width < 1180 ? 0.0000425 : 0.0000225;

function frameLooper(){
	//getting the frequency array of the song
	analyser.getByteFrequencyData(fArray);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	ctx.fillStyle = "rgba(255, 255, 255, " + (intensifies * multiplier - 0.3) + ")";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//resetting the value to zero after drawing it out
	intensifies = 0;

	//drawing the visualiser according to their height
	fArray.forEach((feq, index) => {
		bar_x = index * bar_width;
		const bar_height = feq;
		// Create gradient
		let grd = ctx.createLinearGradient(bar_x, canvasHeight - bar_height, bar_x + bar_width, canvasHeight);
		grd = attachColourStop(grd);
		ctx.fillStyle = grd;
		intensifies += feq;
		ctx.fillRect(bar_x, canvasHeight - bar_height, bar_width, bar_height);
	});
	//looping the frame drawing as well as the range bar for the current time of the song
	window.requestAnimationFrame(frameLooper);
	window.requestAnimationFrame(followSongTime);
}

//The music player could also play song's that's online using the extra feature provided.
async function playFromUrl () {
	//change the system mode to play online songs directly from url
	onlineSongs = true;
	//gettingg the source for the song
	const url = getUrl();
	if (audio.src === "") {
		//if the system has yet to be initialised, initialise the system
		//but using the online source as the initial song
		start(url);
	}else if (url !== null){
		pauseSong();						//pause the current song
		const stats = await changeSource(url);	//change the source for the audio
		if (stat) {
			prevSong();							//change the current index song to the previous value
			changeCurrentTitle();				//change the title also
			showMore();							//hiding the extra feature section
			//resetting the value of the song title.
			document.getElementById("songTitle").value = "";
			setTimeout(() => {		//play the song after a 1.5 seconds delay.
				resumeSong();
			}, 1500);
		}
	}
}
