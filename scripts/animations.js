let isExtraOpening = false
const extraContainer = document.getElementById("showMoreContainer");
const showMoreBtn = document.getElementById("showMore").getElementsByTagName("i")[0];
function showMore () {
	if (isExtraOpening) {
        showMoreBtn.innerHTML = "&#xf191;";
        extraContainer.className = "closeShowMore";
        setTimeout(() => {
            extraContainer.style.visibility = "hidden";
        }, 300);
		isExtraOpening = false;
	}else {
        showMoreBtn.innerHTML = "&#xf150;";
        extraContainer.className = "openShowMore";
        extraContainer.style.visibility = "visible";
		isExtraOpening = true;
	}
}