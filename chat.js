function chatInit() {
	const chat = game.chat;
	const chatContentBox = $('.chatContent').empty();

	let chatContent = ``;

	const currentDate = new Date();

	for (let i in chat) {
		// determine what to show in the timestamp field
		const messageDate = new Date(chat[i].timestamp);

		const isToday = currentDate.toDateString() === messageDate.toDateString();
		const isYesterday = new Date().setDate(currentDate.getDate() - 1) === messageDate.toDateString();
		const sameWeek = new Date().setDate(currentDate.getDate() - 7) > messageDate;

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
			const dayOfMonth = (messageDate.getDate().toString().length === 1 ? "0" : "") + messageDate.getDate() + 1;

			dateString = `${monthAbbrvs[messageDate.getMonth()]} ${dayOfMonth}`;
		}

		chatContent += `
			<div class="chatMessage">
				<div class="chatMessageLine1">
					<div class="chatMessageSender">
						${chat[i].senderName}
					</div>
					<div class="chatMessageTimestamp">
						${dateString}
					</div>
				</div>
				<div class="chatMessageText">
					${chat[i].message}
				</div>
			</div>
		`;
	}

	chatContentBox.html(chatContent);
}

function sendChatMessage(message = document.getElementById('chatInput').value) {
    // make sure there is a real message
    if (!message) {
        return;
    }

    // trim the message
    message = message.trim();

    // send to the server
    $.ajax(
        'sendChatMessage.php',
        {
            data: {
                user: account.id,
                pwd: account.pwd,
                gameId: game.id,
                message
            },
            method: "POST",
            success: function(data) {
                const jsonData = JSON.parse(data);
                if (jsonData.errorLevel > 0) {
					textModal("Error", jsonData.message);
                    return;
                }

                // get the timestamp for the local message
                const today = new Date();
                const year = today.getFullYear();
                const month = (today.getMonth().toString().length === 1 ? "0" : "") + (today.getMonth() + 1);
                const date = (today.getDate().toString().length === 1 ? "0" : "") + (today.getDate() + 1);
                const hours = (today.getHours().toString().length === 1 ? "0" : "") + today.getHours();
                const minutes = (today.getMinutes().toString().length === 1 ? "0" : "") + today.getMinutes();
                const seconds = (today.getSeconds().toString().length === 1 ? "0" : "") + today.getSeconds();

                const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

                // formulate the local message
                const newMessage = {
                    sender: account.id,
                    senderName: account.name,
                    message,
                    timestamp
                };

                // push the message to the local chat
                game.chat.push(newMessage);

                // refresh the chat window
                chatInit();
            },
            error: function() {
                console.error("Could not send message.");
            }
        }
    )
}