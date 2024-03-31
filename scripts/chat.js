function chatInit(dontClearInput = false, dontScroll = false) {
	const chat = game.chat;
	const chatContentBox = document.getElementsByClassName('chatContent')[0];
	const chatInput = document.getElementById('chatInput');

	chatInput.removeEventListener('input', chatBoxResize);
	chatInput.addEventListener('input', chatBoxResize);

	chatContentBox.innerHTML = '';

	let chatContent = ``;

	let hasUnread = false;

	for (let i in chat) {
		// add the correct type of message
		if (chat[i].type === "system") {
			chatContent += systemMessage(chat, i);
		} else {
			chatContent += userMessage(chat, i);
		}

		// add the unread marker if needed
		if (game.players.find(el => el.id === account.id).chatRead == i && i != chat.length - 1) {
			chatContent += /* html */ `
				<div class="unreadMessageMarker"><span>New</span></div>
			`;
			hasUnread = true;
		}
	}

	chatContentBox.innerHTML = chatContent || "This chat is empty.";
	chatContentBox.style.alignItems = chatContent ? '' : 'center';
    if (!dontClearInput) chatInput.value = '';

	// scroll to bottom
	if (!dontScroll) chatScrollBottom();

	if (hasUnread) {
		// read chat on click
		const chatCell = document.getElementById('chatCell')
		chatCell.removeEventListener('click', readChat);
		chatCell.addEventListener('click', readChat); 

		// show the notification badge
		document.getElementById('showChatButton').classList.add('badge');
	} else {
		// hide the notification badge
		document.getElementById('showChatButton').classList.remove('badge');
	}

	chatBoxResize();
}

function chatBoxResize() {
	const scrolledBottom = isChatScrolledBottom();

	const input = document.getElementById('chatInput');

	input.style.height = '1px';
	input.style.overflow = 'hidden';
	input.style.height = (input.scrollHeight - 10) + 'px';
	input.style.overflow = '';

	if (scrolledBottom) chatScrollBottom();
}

function userMessage(c, i) {
	const message = c[i];

	// determine what to show in the timestamp field
	const messageDate = new Date(message.timestamp);
	const dateString = dateToString(messageDate);

	const deleted = message.deleted;
	const isCurrentUser = message.sender == account.id;

	const m = message.message ? decodeURIComponent(message.message) : null;
	const mNoWS = m?.replace(/\s/g, '');

	const onlyEmojiRegex = /^\p{Extended_Pictographic}+$/u
	const showLarge = !deleted && (mNoWS.length / 2) <= 5 && onlyEmojiRegex.test(mNoWS);

	return /* html */ `
		<div class="chatMessage" data-messageid="${i}">
			<div class="chatMessageLine1">
				<div class="chatMessageSender flexGrow">
					${message.senderName}
				</div>
				${isCurrentUser ? /* html */ `
					<button class="iconButton deleteMessageButton" onclick="deleteChatMessage(${i})">
						<span class="material-symbols-rounded tinyIcon finePrint hoverDarken">
							${deleted ? `restore_from_trash` : `delete`}
						</span>
					</button>
				` : ``}
				<div class="chatMessageTimestamp">
					${dateString}
				</div>
			</div>
			<div class="chatMessageText${showLarge ? ` largeChatMessage` : ``}">
				${deleted
					? /* html */ `<i class="finePrint">This message has been deleted.</i>`
					: decodeURIComponent(message.message)
				}
			</div>
		</div>
	`;
}

function systemMessage(c, i) {
	const message = c[i];

	// determine what to show in the timestamp field
	const messageDate = new Date(message.timestamp);
	const dateString = dateToString(messageDate);

	const systemMessageString = systemMessageToString(message.action, message.data);

	return /* html */ `
		<div class="chatMessage" data-messageid="${i}">
			<div class="systemChatMessageLine">
				${
					c[i - 1]?.type === "system" && dateToString(new Date(c[i - 1].timestamp)) === dateString
					? ``
					: /* html */ `
						<div class="finePrint">
							${dateString}
						</div>	
					`
				}
				<div class="chatMessageText">
					${systemMessageString}
				</div>
			</div>
		</div>
	`;
}

function dateToString(d) {
	const currentDate = new Date();

	const isToday = currentDate.toDateString() === d.toDateString();
	let yesterdayDate = new Date();
	yesterdayDate.setDate(yesterdayDate.getDate() - 1);
	const isYesterday = yesterdayDate.toDateString() === d.toDateString();
	const sameWeek = new Date().setDate(currentDate.getDate() - 7) < d;

	let dateString = "";

	if (isToday) {
		// display time
		const rawHours = d.getHours();
		const rawMinutes = d.getMinutes();

		const hours = (rawHours % 12) + (rawHours % 12 === 0 ? 12 : 0);
		const minutes = (rawMinutes.toString().length === 1 ? "0" : "") + rawMinutes;
		const period = (rawHours > 11 ? "PM" : "AM");

		dateString = `${hours}:${minutes} ${period}`;
	} else if (isYesterday) {
		dateString = "Yesterday";
	} else if (sameWeek) {
		// show day of week
		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		dateString = daysOfWeek[d.getDay()];
	} else {
		// show month abbrv. and day of month
		const monthAbbrvs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		const dayOfMonth = (d.getDate().toString().length === 1 ? "0" : "") + d.getDate();

		dateString = `${monthAbbrvs[d.getMonth()]} ${dayOfMonth}`;
	}

	return dateString;
}

function systemMessageToString(type, data) {
	let systemMessageString = type;
	switch (type) {
		case "gameRename":
			systemMessageString = /* html */ `
				<i class="hoverDarken">${game.players.find(a => a.id == data.playerId).name}</i>
				${data.newName
				? /* html */ `
					renamed the game to
					<i class="hoverDarken">${data.newName}</i>
				`
				: `removed the game name`}
			`;
			break;
		case "gameEndVote":
			systemMessageString = /* html */ `
				<i class="hoverDarken">${game.players.find(a => a.id == data.playerId).name}</i>
				voted to end the game
			`;
			break;
		case "gameEndVoteRevoke":
			systemMessageString = /* html */ `
				<i class="hoverDarken">${game.players.find(a => a.id == data.playerId).name}</i>
				revoked their vote to end the game
			`;
			break;
	}

	return systemMessageString;
}

function chatScrollBottom() {
	const chatContentBox = document.getElementsByClassName('chatContent')[0];
	chatContentBox.scrollTop = chatContentBox.scrollHeight;
	if (document.getElementsByClassName('chatUpdatePopup')[0]) hideChatUpdatePopup();
}

function sendChatMessage(message = document.getElementById('chatInput').value) {
    // trim the message
    message = encodeURIComponent(message.trim());

    // make sure there is actually a message
    if (!message) return;

	const input = document.getElementById('chatInput');
	const sendButton = document.getElementsByClassName('chatSendButton')[0];

	input.disabled = true;
	sendButton.disabled = true;

	// update the updateNumber (so we don't re-pull our own message)
	game.updateNumber++;

	request('chat/sendChatMessage.php', {
		user: account.id,
		pwd: account.pwd,
		gameId: game.id,
		message
	}).then(res => {
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}

		// get the timestamp for the local message
		const today = new Date();
		const timestamp = today.toISOString();

		// formulate the local message
		const newMessage = {
			sender: account.id,
			senderName: account.name,
			message: message.replace(/\n/g, "<br>"),
			timestamp
		};

		// push the message to the local chat
		game.chat.push(newMessage);

		// update the local read marker
		game.players.find(el => el.id === account.id).chatRead = game.chat.length - 1;

		// refresh the chat window
		chatInit();
	}).catch(() => {
		console.error("There was an error sending your message. Check your connection and try again.");
	}).finally(() => {
		input.disabled = false;
		sendButton.disabled = false;
	});
}

function readChat() {
	// don't spam the server with requests if the read marker is already up to date
	if (game.players.find(el => el.id == account.id).chatRead == game.chat.length - 1) return;

	request('chat/readChat.php', {
		user: account.id,
		pwd: account.pwd,
		game: game.id
	}).then(res => {
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}

		// update the local read marker after a short timeout
		setTimeout(() => {
			// mark chat as read
			game.players.find(el => el.id === account.id).chatRead = game.chat.length - 1;

			// remove the marker
			const marker = document.getElementsByClassName('unreadMessageMarker')[0];
			if (marker) {
				marker.style.opacity = 0;
				marker.style.height = 0;
				marker.style.borderWidth = 0;
				marker.style.margin = "-7px 0 -3.5px 0";
				setTimeout(() => {
					marker.remove();
				}, 370);
			}
			
			// remove the notification badge
			document.getElementById('showChatButton').classList.remove('badge');

			// reload the games list
			loadGamesList();
		}, 1000);
	}).catch(() => {
		textModal("Error", "There was an error marking the chat as read. Check your connection and try again.");
	});
}

function deleteChatMessage(id) {
	request('chat/deleteChatMessage.php', {
		user: account.id,
		pwd: account.pwd,
		gameId: game.id,
		messageId: id
	}).then(res => {
		// handle errors
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}

		// update message
		if (!game.chat[id].deleted) {
			setChatMessageDeletion(id);
		} else {
			setChatMessageDeletion(id, res.data);
		}
	}).catch(err => {
		textModal("Error", "There was an error deleting your message. Check your connection and try again.");
		throw new Error(err);
	});
}

function setChatMessageDeletion(messageId, content) {
	const deleted = arguments.length === 1;
    game.chat[messageId].deleted = deleted;
	game.chat[messageId].message = deleted ? undefined : content;
    chatInit(true, true);
}

function showChatUpdatePopup() {
	hideChatUpdatePopup();
	const popup = document.createElement('div');
	popup.classList.add('chatUpdatePopup');
	popup.innerHTML = /* html */ `
		<span class="material-symbols-rounded">south</span>
		<span>New Message(s)</span>
	`;
	const chatCell = document.getElementById('chatCell');
	chatCell.appendChild(popup);
	popup.addEventListener('click', chatScrollBottom);
	popup.style.left = ((chatCell.getBoundingClientRect().width - 200) / 2) + 'px';
	setTimeout(() => {
		popup.style.bottom = "75px";
	}, 10);

	document.getElementsByClassName('chatContent')[0].addEventListener('scroll', checkChatUpdatePopup);
}

function checkChatUpdatePopup() {
	const chatContentBox = document.getElementsByClassName('chatContent')[0];
	// if scrolled to bottom
	if (isChatScrolledBottom()) {
		hideChatUpdatePopup();
		chatContentBox.removeEventListener('scroll', checkChatUpdatePopup);
	}
}

function hideChatUpdatePopup() {
	const popup = document.getElementsByClassName('chatUpdatePopup')[0];
	if (!popup) return;
	popup.style.bottom = "";
	setTimeout(() => {
		popup.remove();
	}, 300);
}

function isChatScrolledBottom() {
	const chatContentBox = document.getElementsByClassName('chatContent')[0];
	return chatContentBox.scrollTop >= Math.floor(chatContentBox.scrollHeight - chatContentBox.getBoundingClientRect().height);
}