const modals = {
	createGameModal: {
		width: () => Math.min(500, window.innerWidth - 20),
		height: () => Math.min(500, window.innerHeight - 20)
	},
	letterExchangeModal: {
		width: () => Math.min(750, window.innerWidth - 20),
		height: () => Math.min(200, window.innerHeight - 20)
	},
	textModal: {
		width: () => Math.min(500, window.innerWidth - 20),
		height: () => Math.min(100, window.innerHeight - 20)
	},
	chooseLetterModal: {
		width: () => Math.min(150, window.innerWidth - 20),
		height: () => Math.min(150, window.innerHeight - 20)
	}
};

var escStack = [];

var visibleModals = [];

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
		let modal = $('#' + visibleModals[i]);
		let modalWidth = modals[visibleModals[i]].width();
		let modalHeight = modals[visibleModals[i]].height();
		modal.css({
			'width': modalWidth + 'px',
			'height': modalHeight + 'px',
			'top': (((window.innerHeight - modalHeight) / 2) - 10) + 'px',
			'left': (((window.innerWidth - modalWidth) / 2) - 10) + 'px'
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
		
		// update the position of the modal
		updateModalSizes();

		// show the modal
		return el.removeClass('hidden');
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

		// hide on html click
		$('html').on('click', function() {
			$('html').off('click');
			el.popupClose();
		})

		// determine which direction to show the modal
		let posRight = true;
		if (window.innerWidth - x < 325) {
			posRight = false;
		}

		// calculate the position
		let realX, realY;
		if (posRight) {
			realX = x + 5;
			realY = y - 105;
		} else {
			realX = x - 305;
			realY = y - 105;
		}

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

		// hide the popup
		return this.addClass('hidden');
	}
});

function textModal() {
	// get arguments
	let title, text, cancelable, complete;
	if (arguments.length === 1) {
		title = "";
		text = arguments[0];
	} else if (arguments.length >= 2) {
		title = arguments[0];
		text = arguments[1];
		if (arguments[2]) {
			cancelable = true;
			complete = arguments[3] || function() {};
		}
	} else { // zero or fewer arguments
		title = "Alert!";
		text = "Something just happened, but we don't know what.";
	}

	// set the content of the modal
	$('#textModalTitle').html(title);
	$('#textModalText').html(text).css('order', (!title ? '-1' : ''));
	if (cancelable) {
		$('.textModalButton').removeClass('hidden');
	} else {
		$('.textModalButton').addClass('hidden');
	}
	$('#textModalOkButton').off().on('click', function() {
		$('#textModal').modalClose();
		complete();
	});

	// show the modal
	$('#textModal').modalOpen();
}