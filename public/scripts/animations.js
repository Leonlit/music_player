let isExtraOpening = false
const extraContainer = document.getElementById("showMoreContainer");
const showMoreBtn = document.getElementById("showMore").getElementsByTagName("i")[0];
//animating the open and close of the extra feature section
function showMore () {
	if (isExtraOpening) {
        showMoreBtn.innerHTML = "&#xf191;";
        extraContainer.className = "fadeOutUp";
        setTimeout(() => {
            extraContainer.style.visibility = "hidden";
        }, 300);
		isExtraOpening = false;
	}else {
        showMoreBtn.innerHTML = "&#xf150;";
        extraContainer.className = "fadeInDown";
        extraContainer.style.visibility = "visible";
		isExtraOpening = true;
	}
}

function animatingBgImg (intesity) {
	const bgImageCont = document.getElementById("bgImageContainer");
    bgImageCont.style.transform = `scale(${intesity+ 0.8})`;
    
}