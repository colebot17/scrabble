function updateFriendsList(friends) {
    const friendList = document.getElementById('friendList');

    friendList.innerHTML = "";

    // add each friend
    let listContents = ``;
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];
        let listItem = `
            <div class="friendListItem friendListFriend" id="friend${i}" data-playerid="${friend.id}" data-checked="false">
                <button class="friendCheckbox iconButton" onclick="toggleCheckbox(${i}, 'friend')">
                    <span class="material-symbols-rounded unchecked">
                        check_box_outline_blank
                    </span>
                </button>
                <div class="friendNameContainer flex col">
                    <span class="friendName">
                        ${friend.name}
                    </span>
                    <span class="finePrint friendInfo">
                        ${friend.numGames} active game${friend.numGames !== 1 ? `s` : ``}
                    </span>
                </div>
                <div class="friendControls">
                </div>
            </div>
        `;
        listContents += listItem;
    }

    if (friends.length === 0) {
        listContents += `
            <div class="flex friendListPlaceholder">
                Add your friends with the <span class="material-symbols-rounded smallIcon">group_add</span> button!
            </div>
        `;
    }

    friendList.innerHTML = listContents;

    updateFriendListControls();

    updateSendRequestPage();
}

function updateRequestList(requests) {
    const requestList = document.getElementById('requestList');

    requestList.innerHTML = "";

    // add each request
    let listContents = ``;
    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        let listItem = `
            <div class="friendListItem requestListFriend" id="request${i}" data-playerid="${request.id}" data-checked="false">
                <div class="friendNameContainer flex col">
                    <span class="friendName">
                        ${request.name}
                    </span>
                    <span class="finePrint">
                        wants to be your friend
                    </span>
                </div>
                <div class="friendControls">
                    <button class="iconButton" title="Accept" onclick="acceptRequests([${request.id}])">
                        <span class="material-symbols-rounded">
                            check
                        </span>
                    </button>
                    <button class="iconButton" title="Reject" onclick="rejectRequests([${request.id}])">
                        <span class="material-symbols-rounded">
                            close
                        </span>
                    </button>
                </div>
            </div>
        `;
        listContents += listItem;
    }

    const friendsButton = document.getElementById('friendsButton');
    const heading = document.getElementById('incomingRequestsHeading');
    const otherHeading = document.getElementById('mutualFriendsHeading');
    if (requests.length === 0) {
        requestList.classList.add('hidden');
        friendsButton.classList.remove('badge');
        heading.classList.add('hidden');
        otherHeading.classList.add('hidden');
    } else {
        requestList.classList.remove('hidden');
        friendsButton.classList.add('badge');
        heading.classList.remove('hidden');
        otherHeading.classList.remove('hidden');
    }

    requestList.innerHTML = listContents;

    updateSendRequestPage();
}

function updateSentRequestList(sentRequests) {
    const sentRequestList = document.getElementById('sentRequestList');

    sentRequestList.innerHTML = "";

    // add each request
    let listContents = ``;
    for (let i = 0; i < sentRequests.length; i++) {
        const sentRequest = sentRequests[i];
        let listItem = `
            <div class="friendListItem requestListFriend" id="request${i}" data-playerid="${sentRequest.id}" data-checked="false">
                <div class="friendNameContainer flex col">
                    <span class="friendName">
                        ${sentRequest.name}
                    </span>
                    <span class="finePrint">
                        request sent
                    </span>
                </div>
                <div class="friendControls">
                    <button class="iconButton" title="Cancel" onclick="cancelSentRequests([${sentRequest.id}])">
                        <span class="material-symbols-rounded">
                            close
                        </span>
                    </button>
                </div>
            </div>
        `;
        listContents += listItem;
    }

    const heading = document.getElementById('outgoingRequestsHeading');
    if (sentRequests.length === 0) {
        sentRequestList.classList.add('hidden');
        heading.classList.add('hidden');
    } else {
        sentRequestList.classList.remove('hidden');
        heading.classList.remove('hidden');
    }

    sentRequestList.innerHTML = listContents;

    updateSendRequestPage();
}

function updateCreateGameFriendsList(friends = account.friends) {
    const list = document.getElementById('createGameFriendList');
    list.innerHTML = "";

    let listContents = ``;
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];

        let newGamePlayerList = JSON.parse(document.getElementById('createGameModal').dataset.players);
        if (newGamePlayerList.find(a => a.id == friend.id)) continue;

        let listItem = `
            <div class="friendListItem requestListFriend" id="createGameFriend${i}" data-playerid="${friend.id}">
                <div class="friendNameContainer flex col">
                    <span class="friendName">
                        ${friend.name}
                    </span>
                </div>
                <div class="friendControls">
                    <button class="iconButton" title="Add to Game" onclick="addFriendToNewGame(${friend.id})">
                        <span class="material-symbols-rounded">
                            add
                        </span>
                    </button>
                </div>
            </div>
        `;
        listContents += listItem;
    }

    if (!listContents) {
        listContents += `
            <div class="flex friendListPlaceholder">
                Add some friends so you can quickly access them here!
            </div>
        `;
        setAddPlayerPanelPage('others');
    }

    list.innerHTML = listContents;
}

function toggleCheckbox(friendIndex, prefix = "friend") {
    const checked = 'check_box';
    const unchecked = 'check_box_outline_blank';

    const listItem = document.querySelector('#' + prefix + friendIndex);
    const icon = document.querySelector('#' + prefix + friendIndex + ' .friendCheckbox span');

    const isChecked = listItem.dataset.checked === "true";
    icon.innerHTML = isChecked ? unchecked : checked;

    listItem.dataset.checked = !isChecked;

    updateFriendListControls();

    return !isChecked;
}

function updateFriendListControls() {
    // get number of checked friends
    const friendList = document.getElementById('friendList');
    const friends = friendList.getElementsByClassName('friendListFriend');

    const checkedCount = getCheckedFriends().length;

    // enable/disable buttons
    const checkedEnable = document.querySelectorAll('#removeSelectedFriendsButton, #newGameWithSelectedButton');
    checkedEnable.forEach(el => {
        if (checkedCount > 0) {
            el.disabled = false;
        } else {
            el.disabled = true;
        }
    });

    // update button and link text
    const newGameButton = document.getElementById('newGameWithSelectedButton');
    const addMoreToGameLink = document.getElementById('addMoreToGameLink');
    if (account.friends.length === 0) {
        newGameButton.classList.add('hidden');
    } else {
        newGameButton.classList.remove('hidden');
    }
    if (checkedCount === 0) {
        newGameButton.innerHTML = `Select friends to create game`;
        addMoreToGameLink.innerHTML = `New Game with others`;
    } else {
        newGameButton.innerHTML = `New Game with ${checkedCount} friend${checkedCount !== 1 ? `s` : ``}`;
        addMoreToGameLink.innerHTML = `Add others`;
    }
    
    // update remove selected friends button
    const removeGroupButton = document.querySelector('#removeSelectedFriendsButton span');
    removeGroupButton.innerHTML = checkedCount === 1 ? 'person_remove' : 'group_remove';
}

function getCheckedFriends() {
    const friendList = document.getElementById('friendList');
    const friends = friendList.getElementsByClassName('friendListFriend');

    let checked = [];
    for (let i = 0; i < friends.length; i++) {
        const listItem = friends[i];
        if (listItem.dataset.checked === "true") {
            checked.push(listItem.dataset.playerid);
        }
    }

    return checked;
}

function loadFriendsList() {
    request('friends/loadFriends.php', {
        userId: account.id,
        pwd: account.pwd
    }).then(friendUpdateHandler);
}

function updateSendRequestPage(name = document.getElementById('addFriendField').value) {
    const isSelfNotice = document.getElementById('isSelfNotice');
    const existingFriendNotice = document.getElementById('existingFriendNotice');
    const existingRequestNotice = document.getElementById('existingRequestNotice');
    const existingSentRequestNotice = document.getElementById('existingSentRequestNotice');

    name = name.trim().toLowerCase();
    const btn = document.getElementById('addFriendButton');

    const isSelf = name === account.name.toLowerCase();
    const inFriendsList = account.friends.filter(a => a.name.toLowerCase() === name)?.[0]?.id;
    const inRequestsList = account.requests.filter(a => a.name.toLowerCase() === name)?.[0]?.id;
    const inSentRequestsList = account.sentRequests.filter(a => a.name.toLowerCase() === name)?.[0]?.id;

    // update the button and notices
    btn.innerHTML = inRequestsList ? "Accept Request" : "Send Request";
    if (inRequestsList) {
        btn.classList.add('highlight');
    } else {
        btn.classList.remove('highlight');
    }
    btn.disabled = isSelf || inFriendsList || inSentRequestsList;
    btn.onclick = inRequestsList ? () => {acceptRequests([inRequestsList])} : () => {sendFriendRequest()};

    if (isSelf) {
        isSelfNotice.classList.remove('hidden');
    } else {
        isSelfNotice.classList.add('hidden');
    }
    
    if (inFriendsList) {
        existingFriendNotice.classList.remove('hidden');
    } else {
        existingFriendNotice.classList.add('hidden');
    }

    if (inRequestsList) {
        existingRequestNotice.classList.remove('hidden');
    } else {
        existingRequestNotice.classList.add('hidden');
    }

    if (inSentRequestsList) {
        existingSentRequestNotice.classList.remove('hidden');
    } else {
        existingSentRequestNotice.classList.add('hidden');
    }

    if (inRequestsList) return inRequestsList;
    if (isSelf || inFriendsList || inSentRequestsList) return true;
    return false;
}

function sendFriendRequest(name = document.getElementById('addFriendField').value) {
    name = name.trim();
    if (!name) return;

    const addFriendButton = document.getElementById('addFriendButton');
    const addFriendField = document.getElementById('addFriendField');
    
    addFriendButton.disabled = true;
    addFriendField.disabled = true;

    request('friends/sendRequest.php', {
        userId: account.id,
        pwd: account.pwd,
        friendName: name
    }).then(friendUpdateHandler).then(() => {
        addFriendField.value = "";
        addFriendButton.disabled = false;
        addFriendField.disabled = false;
        addFriendField.focus();

        updateSendRequestPage();
        addFriendButton.innerHTML = "Request Sent!";
        addFriendButton.style.backgroundColor = "rgb(0, 255, 0)";
        addFriendButton.style.transition = "background-color 0.37s";
        setTimeout(() => {
            updateSendRequestPage();
            addFriendButton.style.backgroundColor = "";
        }, 2000);
    });
}

function requestFieldKeyHandler(e) {
    const existingRequest = updateSendRequestPage();
    if (e.key === 'Enter') {
        if (typeof existingRequest === 'number') {
            acceptRequests([existingRequest])
        } else if (!existingRequest) {
            sendFriendRequest();
        }
    }
}

function removeFriends(ids = getCheckedFriends()) {
    if (ids.length === 0) return;
    textModal(
        "Remove Friend" + (ids.length !== 1 ? "s" : ""),
        "Are you sure you want to remove " + ids.length +" friend" + (ids.length !== 1 ? "s" : "")
        + "? You will have to send " + (ids.length !== 1 ? "new requests" : "a new request")
        + " if you change your mind.",
        {
            cancelable: true,
            complete: () => {
                request('friends/removeFriends.php', {
                    userId: account.id,
                    pwd: account.pwd,
                    friendIds: JSON.stringify(ids)
                }).then(friendUpdateHandler);
            }
        }
    );
}

function acceptRequests(ids) {
    if (ids.length === 0) return;
    request('friends/acceptRequests.php', {
        userId: account.id,
        pwd: account.pwd,
        ids: JSON.stringify(ids)
    }).then(friendUpdateHandler);
}

function acceptAllRequests() {
    acceptRequests(getPropArray(account.requests, 'id'));
}

function rejectRequests(ids) {
    if (ids.length === 0) return;
    request('friends/rejectRequests.php', {
        userId: account.id,
        pwd: account.pwd,
        ids: JSON.stringify(ids)
    }).then(friendUpdateHandler);
}

function rejectAllRequests() {
    rejectRequests(getPropArray(account.requests, 'id'));
}

function cancelSentRequests(ids) {
    if (ids.length === 0) return;
    request('friends/cancelSentRequests.php', {
        userId: account.id,
        pwd: account.pwd,
        ids: JSON.stringify(ids)
    }).then(friendUpdateHandler);
}

function cancelAllSentRequests() {
    cancelSentRequests(getPropArray(account.sentRequests, 'id'));
}

function friendUpdateHandler(res) {
    if (res.errorLevel > 0) {
        textModal("Error", res.message);
        return;
    }

    account.friends = res.data.friendList;
    account.requests = res.data.requestList;
    account.sentRequests = res.data.sentRequestList;
    updateFriendsList(account.friends);
    updateRequestList(account.requests);
    updateSentRequestList(account.sentRequests);
}

function addMoreToGame() {
    const selectedFriends = getCheckedFriends();
    let list = [];
    for (let i = 0; i < selectedFriends.length; i++) {
        list.push({
            id: selectedFriends[i],
            name: account.friends.find(a => a.id == selectedFriends[i]).name
        });
    }
    newGame(list);
}