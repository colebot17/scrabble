const SHARE_DATA = {
    title: "Scrabble",
    text: "Play Scrabble with me on Colebot.com!",
    url: "https://scrabble.colebot.com"
};

function enableShare() {
    const shareButton = document.getElementById('shareButton');
    if (navigator.canShare && navigator.canShare(SHARE_DATA)) {
        shareButton.classList.remove('hidden');
    } else {
        shareButton.classList.add('hidden');
    }
}

function share() {
    if (!navigator.canShare || !navigator.canShare(SHARE_DATA)) {
        textModal("Error", "Web Share is not supported on this browser");
        return;
    }
    navigator.share(SHARE_DATA);
}