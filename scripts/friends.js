function setFriendsPage(page) {
    document.getElementById('friendsCell').dataset.page = page;

    if (page === 'addFriends') {
        const field = document.getElementById('addFriendField');
        field.value = "";
        field.focus();
        updateSendRequestPage();
    }
}

function updateFriendsList(friends) {
    const friendList = document.getElementById('friendList');

    friendList.innerHTML = "";

    // add each friend
    let listContents = ``;
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];
        let listItem = `
            <div class="friendListItem friendListFriend" id="friend${i}" data-playerid="${friend.id}" data-checked="false">
                <button class="friendCheckbox iconButton" onclick="toggleFriendCheckbox(${i})">
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
                    <button class="iconButton" title="Remove Friend" onclick="removeFriends([${friend.id}])">
                        <span class="material-symbols-rounded">
                            person_remove
                        </span>
                    </button>
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

function toggleFriendCheckbox(friendIndex) {
    const checked = 'check_box';
    const unchecked = 'check_box_outline_blank';

    const listItem = document.querySelector('#friend' + friendIndex);
    const icon = document.querySelector('#friend' + friendIndex + ' .friendCheckbox span');

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

    // update button text
    const newGameButton = document.getElementById('newGameWithSelectedButton');
    if (checkedCount === 0) {
        newGameButton.innerHTML = `Select friends to create game`;
    } else {
        newGameButton.innerHTML = `New Game with ${checkedCount} friend${checkedCount !== 1 ? `s` : ``}`;
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

    // show badge if unresolved requests
    const btn = document.getElementById('manageRequestsButton');
    if (requests.length > 0) {
        btn.classList.add('badge');
    } else {
        btn.classList.remove('badge');
    }

    if (requests.length === 0) {
        listContents += `
            <div class="flex friendListPlaceholder">
                No pending requests
            </div>
        `;
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

    if (sentRequests.length === 0) {
        listContents += `
            <div class="flex friendListPlaceholder">
                No outgoing requests
            </div>
        `;
    }

    sentRequestList.innerHTML = listContents;

    updateSendRequestPage();
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
    request('friends/removeFriends.php', {
        userId: account.id,
        pwd: account.pwd,
        friendIds: JSON.stringify(ids)
    }).then(friendUpdateHandler);
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