function setFriendsPage(page) {
    document.getElementById('friendsCell').dataset.page = page;

    if (page === 'addFriends') {
        document.getElementById('addFriendField').focus();
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
                        ${friend.numGames} game${friend.numGames !== 1 ? `s` : ``}
                    </span>
                </div>
                <div class="friendControls">
                    <button class="iconButton" title="Remove Friend" onclick="removeFriend(${friend.id})">
                        <span class="material-symbols-rounded">
                            person_remove
                        </span>
                    </button>
                </div>
            </div>
        `;
        listContents += listItem;
    }
    friendList.innerHTML = listContents;

    updateFriendListControls();
    
    setFriendsPage('friends');
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
        return;
    }
    newGameButton.innerHTML = `New Game with ${checkedCount} friend${checkedCount !== 1 ? `s` : ``}`;
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

    friendList.innerHTML = "";

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
                </div>
                <div class="friendControls">
                    <button class="iconButton" title="Reject">
                        <span class="material-symbols-rounded">
                            check
                        </span>
                    </button>
                    <button class="iconButton" title="Reject">
                        <span class="material-symbols-rounded">
                            close
                        </span>
                    </button>
                </div>
            </div>
        `;
        listContents += listItem;
    }
    requestList.innerHTML = listContents;
}

function loadFriendsList() {
    request('friends/loadFriends.php', {
        userId: account.id,
        pwd: account.pwd
    }).then(friendUpdateHandler);
}

function addFriend(name = document.getElementById('addFriendField').value) {
    name = name.trim();
    if (!name) return;
    request('friends/addFriend.php', {
        userId: account.id,
        pwd: account.pwd,
        friendName: name
    }).then(friendUpdateHandler).then(() => {
        document.getElementById('addFriendField').value = "";
    });
}

function removeFriend(id) {
    request('friends/removeFriend.php', {
        userId: account.id,
        pwd: account.pwd,
        friendId: id
    }).then(friendUpdateHandler);
}

function friendUpdateHandler(res) {
    if (res.errorLevel > 0) {
        textModal("Error", res.message);
        return;
    }

    account.friends = res.data;
    updateFriendsList(account.friends);
}