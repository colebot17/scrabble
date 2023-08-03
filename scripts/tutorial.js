// https://codepen.io/colebot17/pen/jOQXaZj

class TutorialStep {
    constructor (selector, content, preFn = () => {}, postFn = () => {}) {
        this.selector = selector;
        this.content = content;
        this.preFn = preFn;
        this.postFn = postFn;
    }
}

const scrabbleTutorial = [
    new TutorialStep('#gamesListRefreshButton', "Press this to get the latest games list!", () => {setGamesList('active')}),
    new TutorialStep('.newGameCard', "Create a new game by clicking here!", () => {}),
    new TutorialStep('#viewInactiveGamesButton', "When a game ends, it gets archived.<br>You can view inactive games here.", () => {}, () => {setGamesList('inactive')}),
    new TutorialStep('#activeGamesButton', "Click here to go back", () => {}, () => {setGamesList('active')})
];

function startTutorial(tutorial = scrabbleTutorial, startingAt = 0) {
    const step = tutorial[startingAt];
    const nextStep = tutorial[startingAt + 1];

    step.preFn();

    const pointingAt = document.querySelector(step.selector);
    showOverlay(pointingAt, step.content, () => {
        step.postFn();
        if (nextStep) {
            startTutorial(tutorial, startingAt + 1);
        } else {
            hideOverlay();
        }
    });
}

function showOverlay(element, text, next = hideOverlay) {
    const overlay = document.getElementById('tutorialOverlay');
    overlay.classList.remove('hidden');

    const maskedElements = document.getElementsByClassName('maskedElement');
    for (let i = 0; i < maskedElements.length; i++) {
        maskedElements[i].classList.remove('maskedElement');
    }

    const content = document.getElementById('overlayContent');
    const mask = document.getElementById('overlayMask');

    element.scrollIntoView();
    element.classList.add('maskedElement');

    const bounds = element.getBoundingClientRect();
    const x = bounds.left;
    const y = bounds.bottom + 10;

    content.style.left = x + 'px';
    content.style.top = y + 'px';
    content.innerHTML = text;

    const maskPadding = 5;

    const maskX = bounds.left - maskPadding;
    const maskY = bounds.top - maskPadding;

    const maskWidth = (bounds.right - bounds.left) + (2 * maskPadding);
    const maskHeight = (bounds.bottom - bounds.top) + (2 * maskPadding);

    mask.style.left = maskX + 'px';
    mask.style.top = maskY + 'px';
    mask.style.width = maskWidth + 'px';
    mask.style.height = maskHeight + 'px';

    const elCompStyle = window.getComputedStyle(element);

    const elBorderRadius = parseInt(elCompStyle.getPropertyValue('border-radius').slice(0, -2));
    const maskBorderRadius = elBorderRadius + maskPadding;
    mask.style.borderRadius = maskBorderRadius + 'px';


    overlay.addEventListener('click', next, {once: true});
}

function hideOverlay() {
    document.getElementById('tutorialOverlay').classList.add('hidden');

    const mask = document.getElementById('overlayMask');
    mask.style.top = "";
    mask.style.left = "";
    mask.style.width = "";
    mask.style.height = "";

    const content = document.getElementById('overlayContent');
    content.style.top = "";
    content.style.left = "";

    const maskedElements = document.getElementsByClassName('maskedElement');
    for (let i = 0; i < maskedElements.length; i++) {
        maskedElements[i].classList.remove('maskedElement');
    }
}