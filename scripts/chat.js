function chatInit(clearInput = true) {
	const chat = game.chat;
	const chatContentBox = document.getElementsByClassName('chatContent')[0];
	const chatInput = document.getElementById('chatInput');

	chatContentBox.innerHTML = '';

	let chatContent = ``;

	const currentDate = new Date();

	let hasUnread = false;

	for (let i in chat) {
		// determine what to show in the timestamp field
		const messageDate = new Date(chat[i].timestamp);

		const isToday = currentDate.toDateString() === messageDate.toDateString();
        let yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
		const isYesterday = yesterdayDate.toDateString() === messageDate.toDateString();
		const sameWeek = new Date().setDate(currentDate.getDate() - 7) < messageDate;

		let dateString;

		if (isToday) {
			// display time
			const rawHours = messageDate.getHours();
			const rawMinutes = messageDate.getMinutes();

			const hours = (rawHours % 12) + (rawHours % 12 === 0 ? 12 : 0);
			const minutes = (rawMinutes.toString().length === 1 ? "0" : "") + rawMinutes;
			const period = (rawHours > 11 ? "PM" : "AM");

			dateString = `${hours}:${minutes} ${period}`;
		} else if (isYesterday) {
			dateString = "Yesterday";
		} else if (sameWeek) {
			// show day of week
			const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			dateString = daysOfWeek[messageDate.getDay()];
		} else {
			// show month abbrv. and day of month
			const monthAbbrvs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			const dayOfMonth = (messageDate.getDate().toString().length === 1 ? "0" : "") + messageDate.getDate();

			dateString = `${monthAbbrvs[messageDate.getMonth()]} ${dayOfMonth}`;
		}

		const deleted = chat[i].deleted;
		const isCurrentUser = chat[i].sender == account.id;

		chatContent += /* html */ `
			<div class="chatMessage" data-messageid="${i}">
				<div class="chatMessageLine1">
					<div class="chatMessageSender flexGrow">
						${chat[i].senderName}
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
				<div class="chatMessageText">
					${deleted ? /* html */ `<span class="finePrint"><i>This message has been deleted.</i></span>` : chat[i].message}
				</div>
			</div>
		`;

		if (game.players.find(el => el.id === account.id).chatRead == i && i != chat.length - 1) {
			chatContent += /* html */ `
				<div class="unreadMessageMarker"><span>New</span></div>
			`;
			hasUnread = true;
		}
	}

	chatContentBox.innerHTML = chatContent || "This chat is empty.";
	chatContentBox.style.alignItems = chatContent ? '' : 'center';
    if (clearInput) chatInput.value = '';

	// scroll to bottom
	chatContentBox.scrollTop = chatContentBox.scrollHeight;

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
}

function sendChatMessage(message = document.getElementById('chatInput').value) {
    // make sure there is a real message
    if (!message.trim()) {
        return;
    }

    // trim the message
    message = message.trim();

	const input = document.getElementById('chatInput');
	const sendButton = document.getElementsByClassName('chatSendButton')[0];
	
	input.disabled = true;
	sendButton.disabled = true;

	request('sendChatMessage.php', {
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
			message,
			timestamp
		};

		// push the message to the local chat
		game.chat.push(newMessage);

		// update the local read marker
		game.players.find(el => el.id === account.id).chatRead = game.chat.length - 1;

		// refresh the chat window
		chatInit();

		// update the updateNumber (so we don't re-pull our own message)
		game.updateNumber++;
	}).error(() => {
		console.error("There was an error sending your message. Check your connection and try again.");
	}).finally(() => {
		input.disabled = false;
		sendButton.disabled = false;
	});
}

function readChat() {
	// don't spam the server with requests if the read marker is already up to date
	if (game.players.find(el => el.id == account.id).chatRead == game.chat.length - 1) return;

	request('readChat.php', {
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
			game.players.find(el => el.id === account.id).chatRead = game.chat.length - 1;
		}, 1000);

		// remove the notification badge
		document.getElementById('showChatButton').classList.remove('badge');

		// reload the chat window
		chatInit();
	}).catch(() => {
		textModal("Error", "There was an error marking the chat as read. Check your connection and try again.");
	});
}

function deleteChatMessage(id) {
	request('deleteChatMessage.php', {
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

		// update the local chat object
		const del = !game.chat[id].deleted;
		
		game.chat[id].deleted = del;
		game.chat[id].message = res.data;

		chatInit(); // refresh chat window
	}).catch(() => {
		textModal("Error", "There was an error deleting your message. Check your connection and try again.");
	});
}