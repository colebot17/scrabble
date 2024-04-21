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

const settingsTutorial = [
    new TutorialStep('#signInCell', "Welcome to Settings! Click to learn more."),
    new TutorialStep('#accountSettingsSection', "Here are some useful actions for your account."),
    new TutorialStep('#displayModeSettingSection', "If you have a small screen, try changing your view to fit more onscreen."),
    new TutorialStep('#manageNotificationsSection', "To receive email notifications whenever it's your turn in a game, add your email address here."),
    new TutorialStep('#chatSettingSection', "For distraction-free gameplay, you can choose to always hide the chat box, even on wide screens."),
    new TutorialStep('#languageSettingSection', "You can choose your default language here. You can still change a game's language individually when you create it.")
]

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
        mask.id = "tutorialOverlayMask";
        mask.className = "tutorialOverlayMask";
        overlay.appendChild(mask);
        
        const content = document.createElement('div');
        content.id = "tutorialOverlayContent";
        content.className = "tutorialOverlayContent";
        overlay.appendChild(content);

        document.appendChild(overlay);
    }

    overlay.classList.remove('hidden');

    const maskedElements = document.getElementsByClassName('maskedElement');
    for (let i = 0; i < maskedElements.length; i++) {
        maskedElements[i].classList.remove('maskedElement');
    }

    element.scrollIntoView();
    element.classList.add('maskedElement');
    const bounds = element.getBoundingClientRect();

    // position the yellow mask
    const mask = document.getElementById('tutorialOverlayMask');

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

    // position the text content
    const content = document.getElementById('tutorialOverlayContent');

    content.innerHTML = text;
    content.style.maxWidth = "";
    content.style.width = (window.innerWidth - bounds.left) + 'px';
    const contentBounds = content.getBoundingClientRect();

    const spaceAbove = maskY;
    const spaceLeft = maskX;
    const spaceBelow = window.innerHeight - (maskY + maskHeight);
    const spaceRight = window.innerWidth - (maskX + maskWidth);

    const percentAbove = contentBounds.height / spaceAbove;
    const percentLeft = contentBounds.width / spaceLeft;
    const percentBelow = contentBounds.height / spaceBelow;
    const percentRight = contentBounds.width / spaceRight;

    let smallestPercent = Infinity;
    let smallestPercentName;
    if (percentAbove < smallestPercent) {
        smallestPercent = percentAbove;
        smallestPercentName = "above";
    }
    if (percentLeft < smallestPercent) {
        smallestPercent = percentLeft;
        smallestPercentName = "left";
    }
    if (percentBelow < smallestPercent) {
        smallestPercent = percentBelow;
        smallestPercentName = "below";
    }
    if (percentRight < smallestPercent) {
        smallestPercent = percentRight;
        smallestPercentName = "right";
    }


    let contentX, contentY;

    if (smallestPercentName === "above") {
        contentX = bounds.left - maskPadding;
        contentY = bounds.top - (10 + contentBounds.height);
    } else if (smallestPercentName === "left") {
        contentX = bounds.left - (10 + contentBounds.width);
        contentY = bounds.top - maskPadding;
    } else if (smallestPercentName === "below") {
        contentX = bounds.left - maskPadding;
        contentY = bounds.bottom + 10;
    } else if (smallestPercentName === "right") {
        contentX = bounds.right + 10;
        contentY = bounds.top - maskPadding;
    }

    content.style.left = contentX + 'px';
    content.style.top = contentY + 'px';
    content.style.maxWidth = content.style.width;
    content.style.width = "";


    overlay.addEventListener('click', next, {once: true});
}

function hideOverlay() {

    const overlay = document.getElementById('tutorialOverlay');
    const mask = document.getElementById('tutorialOverlayMask');
    const content = document.getElementById('tutorialOverlayContent');

    overlay.style.opacity = "0";

    const top = parseInt(mask.style.top.slice(0, -2));
    const left = parseInt(mask.style.left.slice(0, -2));
    const width = parseInt(mask.style.width.slice(0, -2));
    const height = parseInt(mask.style.height.slice(0, -2));

    mask.style.top = (top + (height / 2)) + 'px';
    mask.style.left = (left + (width / 2)) + 'px';

    mask.style.width = "0";
    mask.style.height = "0";
    

    setTimeout(() => {
        overlay.classList.add('hidden');

        content.innerHTML = "";
        overlay.style.opacity = "";

        content.style.top = "";
        content.style.left = "";

        mask.style.top = "";
        mask.style.left = "";
        mask.style.width = "";
        mask.style.height = "";

        const maskedElements = document.getElementsByClassName('maskedElement');
        for (let i = 0; i < maskedElements.length; i++) {
            maskedElements[i].classList.remove('maskedElement');
        }
    }, 200);
}

function setTutorial(tutorialName, value) {
    account.tutorials[tutorialName] = value;
    
    request('setTutorial.php', {
        user: account.id,
        pwd: account.pwd,
        tutorialName: tutorialName,
        tutorialValue: value
    });
}