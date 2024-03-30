// https://codepen.io/colebot17/pen/jOQXaZj

class TutorialStep {
    constructor (selector, content, preFn = () => {}, postFn = () => {}, delay = 0) {
        this.selector = selector;
        this.content = content;
        this.preFn = preFn;
        this.postFn = postFn;
        this.delay = delay;
    }
}

const scrabbleTutorial = [
    new TutorialStep('#gamesListRefreshButton', "Press this to get the latest games list!", () => {setGamesList('active')}),
    new TutorialStep('#viewInactiveGamesButton', "When a game ends, it gets archived.<br>You can view inactive games here.", () => {}, () => {setGamesList('inactive')}),
    new TutorialStep('#activeGamesButton', "Click here to go back", () => {}, () => {setGamesList('active')}),
    new TutorialStep('.newGameCard', "Create a new game by clicking here!", () => {}, () => {newGame();setAddPlayerPanelPage('others');}, 370),
    new TutorialStep('#createGamePlayerInput', "Add your friends by entering their usernames here")
];

const firstGameTutorial = [
    new TutorialStep('#scrabbleCanvas', "Welcome to your first game! This is the canvas. Drag letters from the letter bank at the bottom onto the board at the top. The letters you place must be connected to the center of the board."),
    new TutorialStep('#makeMoveButton', "When you are finished, click here to make your move."),
    new TutorialStep('.moreGameControls summary span', "View additional options for your turn by clicking here."),
    new TutorialStep('.gamePlayerList', "View player and point info in this section. The player with the underline has the next move."),
    new TutorialStep('#backToGamesListButton', "To return to view all your games, use the home button here.")
];

function startTutorial(tutorial = scrabbleTutorial, startingAt = 0) {
    const step = tutorial[startingAt];
    const nextStep = tutorial[startingAt + 1];

    step.preFn();

    const pointingAt = document.querySelector(step.selector);
    showOverlay(pointingAt, step.content, () => {
        step.postFn();
        setTimeout(() => {
            if (nextStep) {
                startTutorial(tutorial, startingAt + 1);
            } else {
                hideOverlay();
            }
        }, step.delay);
    });
}

function showOverlay(element, text, next = hideOverlay) {
    let overlay = document.getElementById('tutorialOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = "tutorialOverlay";
        overlay.className = "overlay hidden";

        const mask = document.createElement('div');
        mask.id = "overlayMask";
        mask.className = "overlayMask";
        overlay.appendChild(mask);
        
        const content = document.createElement('div');
        content.id = "overlayContent";
        content.className = "overlayContent";
        overlay.appendChild(content);

        document.appendChild(overlay);
    }

    overlay.classList.remove('hidden');

    const maskedElements = document.getElementsByClassName('maskedElement');
    for (let i = 0; i < maskedElements.length; i++) {
        maskedElements[i].classList.remove('maskedElement');
    }

    const content = document.getElementById('overlayContent');
    const mask = document.getElementById('overlayMask');

    element.scrollIntoView();
    element.classList.add('maskedElement');

    const maskPadding = 5;

    const bounds = element.getBoundingClientRect();
    const x = bounds.left - maskPadding;
    const y = bounds.bottom + 10;

    content.style.left = x + 'px';
    content.style.top = y + 'px';
    content.innerHTML = text;

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