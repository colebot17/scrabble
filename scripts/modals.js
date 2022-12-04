const modals = {
	createGameModal: {
		width: 500,
		height: 500
	},
	letterExchangeModal: {
		width: 600,
		height: 0
	},
	textModal: {
		width: 500,
		height: 100
	},
	chooseLetterModal: {
		width: 150,
		height: 110
	}
};

var escStack = [];

var visibleModals = [];
var visiblePopups = [];

window.addEventListener('resize', function() {
	updateModalSizes();
})

$('html').on('keyup', function(e) {
	if (e.key === 'Escape' && escStack.length > 0) {
		escStack[escStack.length - 1].action();
	}
});

function addToEscStack(action, name) {
	removeFromEscStack(name);
	escStack.push({
		name: name,
		action: action
	});
}
function removeFromEscStack(name) {
	if (name === undefined) { // if name is omitted, remove the last item
		escStack.splice(escStack.length - 1, 1);
	} else if (typeof name === 'int') { // if name is an int, remove the item at that index
		escStack.splice(name, 1);
	} else { // if name is anything else, find the entry with that name
		for (var i = escStack.length - 1; i >= 0; i--) {
			if (escStack[i].name === name) {
				escStack.splice(i, 1);
			}
		}	
	}
}

function updateModalSizes() {
	// update the sizes of all visible modals
	for (let i in visibleModals) {
		const modal = $('#' + visibleModals[i]);

		const prefWidth = modals[visibleModals[i]].width;
		const prefHeight = modals[visibleModals[i]].height;

		const width = Math.min(prefWidth, window.innerWidth - 20);

		modal.css({
			'top': '0',
			'left': '0',
			'height': 'auto',
			'width': width + 'px',
			'opacity': '0'
		});

		const actualHeight = modal.height();
		const height = Math.min(Math.max(prefHeight, actualHeight), window.innerHeight - 20);

		modal.css({
			'width': width + 'px',
			'height': height + 'px',
			'top': (((window.innerHeight - height) / 2) - 10) + 'px',
			'left': (((window.innerWidth - width) / 2) - 10) + 'px',
			'opacity': ''
		});
	}
}

jQuery.fn.extend({
	modalOpen: function() {
		var el = this;
		// update the escape stack
		addToEscStack(function() {el.modalClose()}, el.attr('id'));

		// update the visible modals list
		if (!visibleModals.includes(el.attr('id'))) {
			visibleModals.push(el.attr('id'));
		}

		// show the modal
		el.removeClass('hidden');
		
		// update the position of the modal
		updateModalSizes();
		
		return el;
	},
	modalClose: function() {
		// update the escape stack
		removeFromEscStack(this.attr('id'));

		// update the visible modals list
		if (visibleModals.includes(this.attr('id'))) {
			visibleModals.splice(visibleModals.indexOf(this.attr('id'), 1));
		}

		// hide the modal
		return this.addClass('hidden');
	},
	popupOpen: function(x, y) {
		var el = this;
		// update the escape stack
		addToEscStack(function () { el.popupClose() }, el.attr('id'));
		
		// update the visible popups list
		if (!visiblePopups.includes(el.attr('id'))) {
			visiblePopups.push(el.attr('id'));
		}

		// hide on outside mouseup
		$('#scrabbleGrid').on('mouseup', function() {
			$('#scrabbleGrid').off('mouseup');
			el.popupClose();
		});

		// determine which direction to show the modal
		posRight = window.innerWidth - x > x;

		// calculate the position
		let realX, realY;
		if (posRight) {
			realX = x + 5;
			realY = y - 105;
		} else {
			realX = x - 325;
			realY = y - 105;
		}

		// make sure it doesn't go off the page
		realX = Math.max(Math.min(realX, window.innerWidth), 0);
		realY = Math.max(Math.min(realY, window.innerHeight), 0);

		// set the position
		el.css({
			top: realY + 'px',
			left: realX + 'px'
		});

		// show the popup
		return el.removeClass('hidden');
	},
	popupClose: function () {
		// update the escape stack
		removeFromEscStack(this.attr('id'));
		
		// update the visible popups list
		if (visiblePopups.includes(this.attr('id'))) {
			visiblePopups.splice(visiblePopups.indexOf(this.attr('id'), 1));
		}

		// remove mouseup listener from grid
		$('#scrabbleGrid').off('mouseup');

		// hide the popup
		return this.addClass('hidden');
	}
});

function textModal(
	title = "Alert!",
	text = "Something just happened, but we don't know what.",
	userOptions
) {
	// define default values
	const defaultOptions = {
		cancelable: false,
		complete: () => {},
		allowInput: false,
		inputPlaceholder: "",
		passwordField: false
	}

	// combine user options with default options
	const options = {...defaultOptions, ...userOptions};


	// set the content of the modal
	$('#textModalTitle').html(title);
	$('#textModalText').html(text).css('order', (!title ? '-1' : ''));

	if (options.cancelable) {
		$('#textModalCancelButton').removeClass('hidden');
	} else {
		$('#textModalCancelButton').addClass('hidden');
	}

	const textModalInput = $('#textModalInput')

	if (options.allowInput) {
		textModalInput.removeClass('hidden').attr('placeholder', options.inputPlaceholder).attr('type', (options.passwordField ? 'password' : 'text')).val("");
	} else {
		textModalInput.addClass('hidden');
	}

	function ok() {
		$('#textModal').modalClose();
		if (options.allowInput) {
			const inputVal = textModalInput.val();
			options.complete(inputVal);
		} else {
			options.complete();
		}
	}

	$('#textModalOkButton').off().on('click', ok);
	textModalInput.off().on('keypress', function(e) {if (e.key === 'Enter') {ok();}});

	// show the modal
	$('#textModal').modalOpen();

	// focus the input field if necessary
	if (options.allowInput) {
		textModalInput[0].focus();
	}
}