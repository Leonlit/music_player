const errorMsgContainer = document.getElementById("errorMsgContainer")
const errorMsg = document.getElementById("errorMsg");
const shader = document.getElementById("shader");
var showingError = false;

//displaying the error occured
function showError (errorText) {
    showingError = true;
    errorMsg.innerHTML = errorText;
    errorMsgContainer.classList.remove("fadeOut");
    errorMsgContainer.classList.add("fadeIn");
    errorMsgContainer.style.visibility = "visible";
    shader.style.visibility = "visible";
    shader.classList.add("fadeIn");
    shader.classList.remove("fadeOut");
}

//closing the animation with some animation.
function closeError () {
    errorMsgContainer.classList.remove("fadeIn");
    errorMsgContainer.classList.add("fadeOut");
    shader.classList.remove("fadeIn");
    shader.classList.add("fadeOut");
    errorMsgContainer.addEventListener("webkitAnimationEnd", closingErrorAnimationEnd);
    errorMsgContainer.addEventListener("animationend", closingErrorAnimationEnd);
}

//when the animation stop, hide the elememnt
function closingErrorAnimationEnd () {
    errorMsgContainer.style.visibility = "hidden";
    shader.style.visibility = "hidden";
    showingError = false;
}

async function fileExists (file) {
    return await fetch(file)
        .then(response => {
            console.log(response.status);
            if (response.status >= 200 && response.status <= 299) {
                return true;
            }else {
                return false;
            }
        }).catch (err=>{
            showError("Error!!! An network error occured. Please make sure you have internet connection and try again later.");
        })
}