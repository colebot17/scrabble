function setFriendsPage(page) {
    document.getElementById('friendsCell').dataset.page = page;
}

function updateFriendsList(friends) {
    const friendList = document.getElementById('friendList');

    friendList.innerHTML = "";

    // add each friend
    let listContents = ``;
    for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];
        let listItem = `
            <div class="friendListFriend" id="friend${i}" data-friendid="${friend.id}" data-checked="false">
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
                    <button id="removeFriendButton" class="iconButton" title="Remove Friend" onclick="removeFriend(${friend.id})">
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

    let checkedCount = 0;
    for (let i = 0; i < friends.length; i++) {
        const listItem = friends[i];
        if (listItem.dataset.checked === "true") {
            checkedCount++;
        }
    }

    const checkedEnable = document.querySelectorAll('#removeSelectedFriendsButton, #newGameWithSelectedButton');

    checkedEnable.forEach(el => {
        if (checkedCount > 0) {
            el.disabled = false;
        } else {
            el.disabled = true;
        }
    });
}