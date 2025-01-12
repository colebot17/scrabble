$(function() {
	// auto sign in
	const savedName = sessionStorage.name || localStorage.name;
	const savedPwd = sessionStorage.pwd || localStorage.pwd;
	if (savedName) {
		signIn(savedName, savedPwd, false).then(() => checkParams());
	} else {
		setSignInMode('signIn');
		document.getElementById('scrabbleGrid').dataset.signedin = "false";
		checkParams();
	}

	// check share ability
	enableShare();
});

var account = {};

async function signIn(name = document.getElementById('signInUsername').value, pwd = document.getElementById('signInPwd').value, showToast = true) {
	const formEl = document.getElementById('signInForm');
	const usernameField = document.getElementById('signInUsername');
	const pwdField = document.getElementById('signInPwd');
	const submitButton = document.getElementById('signInSubmitButton');

	// show the loading screen
	const scrabbleGrid = document.getElementById('scrabbleGrid');
	scrabbleGrid.dataset.signedin = "loading";

	// make the request
	var req = request('signIn.php', {name, pwd});

	// set a minimum load time
	var timer = new Promise(resolve => {
		setTimeout(resolve, 740);
	});

	// make sure the material-symbols are ready
	var msLoaded = new Promise((resolve, reject) => {
		let num = 0;
		const int = setInterval(() => {
			const ready = document.fonts.check("24px 'Material Symbols Rounded'");
			if (ready) {
				clearInterval(int);
				resolve();
				return;
			}
			num++;
			if (num > 600) {
				clearInterval(int);
				reject();
				return;
			}
		}, 100);
	});

	try {

		// when the request is finished, the document's fonts are loaded, and the timer is up
		const values = await Promise.all([req, document.fonts.ready, msLoaded, timer]);

		// the response from the sign in request specifically
		// (we don't care about the other requests)
		const res = values[0];

		// if there has been an error (incorrect name/pwd),
		if (res.errorLevel > 0) {
			textModal("Error", res.message, {
				complete: function() {
					// set up the form
					setSignInMode('signIn');
					
					usernameField.select();
					pwdField.value = "";
				}
			});

			// clear localStorage and sessionStorage
			localStorage.removeItem('name');
			localStorage.removeItem('pwd');
			sessionStorage.removeItem('name');
			sessionStorage.removeItem('pwd');

			// show the signed out screen
			scrabbleGrid.dataset.signedin = "false";

			return;
		}
		account = res.data;
		account.pwd = pwd;

		if (!account.temporaryAccount) {
			localStorage.name = account.name;
			localStorage.pwd = pwd;
		}
		sessionStorage.name = account.name;
		sessionStorage.pwd = pwd;

		const accountNameLabel = document.getElementById('accountNameLabel');
		accountNameLabel.textContent = account.name;
		accountNameLabel.innerHTML = "<b>" + accountNameLabel.textContent + "</b>";

		formEl.reset();
		setSignInMode('signOut');

		if (!account.temporaryAccount) {
			saveAccount(res.data.name, pwd);
			updateSavedAccountList();
		}

		updateGamesList();
		
		updateFriendsList(account.friends);
		updateRequestList(account.requests);
		updateSentRequestList(account.sentRequests);

		document.getElementById(account.defaultLang + 'DefaultLanguageOption').checked = true;
		initDefaultLanguageSelectors();

		// show the signed in page
		scrabbleGrid.dataset.signedin = "true";

		// show the toast
		if (showToast) toast("Account", "Now signed in as <b>" + account.name + "</b>");

		// go ahead and load the files for checking points for the user's default language
		lazyLoadInfo(account.defaultLang);

	} catch (err) {

		console.error("Sign-in could not be completed:", err);
		setSignInMode('signIn');
		
		scrabbleGrid.dataset.signedin = "false";

	}
}

function emailAddressCheck() {
	const usernameField = document.getElementById('createAccountUsername');
	const username = usernameField.value;
	const isEmail = /.+\@.+\..+/gi.test(username);
	if (isEmail) {
		document.getElementById('emailAddressWarning').classList.remove('hidden');
	} else {
		document.getElementById('emailAddressWarning').classList.add('hidden');
	}
}

function createAccount(name = $('#createAccountUsername').val(), pwd = $('#createAccountPwd').val(), confirmPwd = $('#createAccountConfirmPwd').val()) {
	if (name.length < 3) {
		alert("Name must be at least three characters long.");
		return;
	}
	if (pwd.length < 8) {
		alert("Password must be at least eight characters long.");
		return;
	}
	if (pwd !== confirmPwd) {
		alert("Passwords must match.");
		return;
	}

	request('createAccount.php', {name, pwd}).then(res => {
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}
		signIn(name, pwd);
	}).catch(err => {
		console.error(err);
	});
}

function changePassword(
	confirmed = false,
	pwd = document.getElementById('changePasswordPwd').value,
	newPwd = document.getElementById('changePasswordNewPwd').value,
	newPwdConfirm = document.getElementById('changePasswordConfirmNewPwd').value
) {
	if (newPwd !== newPwdConfirm) {
		textModal('Error', 'The passwords must match');
		return;
	}

	if (!confirmed) {
		setSignInMode('changePasswordConfirm');
		return;
	}
	request('changePassword.php', {user: account.id, pwd, newPwd}).then(res => {
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}
		removeSavedAccount(getSavedAccountIndex(account.name), false);
		signIn(account.name, newPwd);
		textModal("Change Password", "Password Changed.");
	}).catch(err => {
		console.error(err);
	});
}

function changeUsername(
	confirmed = false,
	pwd = document.getElementById('changeUsernamePwd').value,
	newName = document.getElementById('changeUsernameNewName').value
) {
	if (!confirmed) {
		setSignInMode('changeUsernameConfirm');
		return;
	}

	request('changeUsername.php', {user: account.id, pwd, newName}).then(res => {
		if (res.errorLevel > 0) {
			textModal("Error", res.message);
			return;
		}
		removeSavedAccount(getSavedAccountIndex(account.name), false);
		signIn(newName, account.pwd);
		textModal("Change Username", res.message);
	}).catch(err => {
		console.error(err);
	});
}

function signOut(confirm = true, saveAccount = false) {
	function doIt() {
		// show the loader for a little bit
		document.getElementById('scrabbleGrid').dataset.signedin = "loading";

		if (!saveAccount && localStorage.savedAccounts) {
			const savedAccounts = JSON.parse(localStorage.savedAccounts);
			const index = savedAccounts.findIndex(a => a.name === account.name);
			if (index >= 0) removeSavedAccount(index, false);
		}

		// remove name and password from storage
		localStorage.removeItem('name');
		localStorage.removeItem('pwd');
		sessionStorage.removeItem('name');
		sessionStorage.removeItem('pwd');

		// remove the account and any loaded game
		account = {};
		game = {};
		canvas.destruct = true;

		removeHandlers();

		// switch the sign in mode
		setSignInMode('signIn');

		// wait a bit then change the app state
		setTimeout(() => {
			document.getElementById('scrabbleGrid').dataset.signedin = "false";
		}, 740);
	}

	if (confirm) {
		textModal("Sign Out", "Are you sure you want to sign out?", {
			cancelable: true,
			complete: doIt
		});
	} else {
		doIt();
	}
}

function resetPassword(
	name = document.getElementById('resetPasswordUsername').value,
	key = document.getElementById('resetPasswordKey').value,
	newPwd = document.getElementById('resetPasswordPwd').value,
	newPwdConfirm = document.getElementById('resetPasswordConfirmPwd').value
) {
	if (newPwd !== newPwdConfirm) {
		textModal('Error', 'The passwords must match');
		return;
	}
	$.ajax(
		windowLocation + '/php/resetPassword.php',
		{
			data: {
				name,
				key,
				newPwd
			},
			method: "POST",
			success: function(data) {
				const jsonData = JSON.parse(data);
				if (jsonData.errorLevel > 0) {
					textModal("Error", jsonData.message);
					return;
				}
				signIn(name, newPwd);
				textModal('Reset Password', 'Password Reset. Your key is now invalid.');
			},
			error: function() {
				console.error("Could not reset password.");
			}
		}
	);
}

// account switcher code

function updateSavedAccountList() {
	// load saved accounts from local storage and display them

	const savedAccounts = localStorage.savedAccounts ? JSON.parse(localStorage.savedAccounts) : [];
	
	const list = document.getElementById('accountSwitcherList');

	list.innerHTML = "";

	for (let i = 0; i < savedAccounts.length; i++) {
		const isCurrent = savedAccounts[i].name === account?.name;
		list.innerHTML += /* html */ `
			<div class="account" data-savedaccountid="${i}">
				<span class="accountName">${savedAccounts[i].name}${isCurrent ? ` <span class="textColorLight">(You)</span>` : ``}</span>
				<button class="iconTextButton accountSignInButton noMargin semiHighlight" onclick="signIn('${savedAccounts[i].name}', '${savedAccounts[i].pwd}', true)"${isCurrent ? ` disabled` : ``}>
					<span class="material-symbols-rounded smallIcon">login</span>
					${isCurrent ? `Signed In` : `Sign In`}
				</button>
				<button class="iconTextButton accountRemoveButton noMargin" onclick="removeSavedAccount(${i});${isCurrent ? `signOut();` : ``}">
					<span class="material-symbols-rounded smallIcon">${isCurrent ? `logout` : `delete`}</span>
					${isCurrent ? `Sign Out` : `Remove`}
				</button>
			</div>
		`;
	}

	list.innerHTML += /* html */ `
		<button class="account addSavedAccountButton" onclick="addAccount()">
			<span class="material-symbols-rounded largeIcon">add</span>
		</button>
	`;
}

function addAccount() {
	// set up the sign in form
	setSignInMode('signIn');
	document.getElementById('signInBackButton').classList.remove('hidden');
	document.getElementById('createAccountModeButton').classList.add('hidden');
	document.getElementById('signInForm').reset();

	document.getElementById('signInUsername').disabled = false;
	document.getElementById('signInPwd').disabled = false;
	document.getElementById('signInSubmitButton').disabled = false;
}

function saveAccount(name, pwd) {
	// save an account into local storage
	const savedAccounts = localStorage.savedAccounts ? JSON.parse(localStorage.savedAccounts) : [];
	if (savedAccounts.find(a => a.name === name)) return;
	savedAccounts.push({name, pwd});
	localStorage.savedAccounts = JSON.stringify(savedAccounts);
}

function removeSavedAccount(index, confirm = true) {
	// remove a specific account from local storage

	if (!localStorage.savedAccounts) return;

	const savedAccounts = JSON.parse(localStorage.savedAccounts);

	function doIt() {
		savedAccounts.splice(index, 1)[0].name;
		localStorage.savedAccounts = JSON.stringify(savedAccounts);
		updateSavedAccountList();
	}

	if (confirm) {
		textModal('Remove Saved Account', `Are you sure you want to remove this account? <b>${savedAccounts[index].name}</b> will need to sign in again to use this device later.`, {
			cancelable: true,
			complete: doIt
		});
	} else {
		doIt();
	}
}

function removeAllSavedAccounts(confirm = true) {
	function doIt() {
		localStorage.savedAccounts = JSON.stringify([{name: account.name, pwd: account.pwd}]);
		updateSavedAccountList();
	}

	if (confirm) {
		textModal('Clear Accounts', 'Are you sure you want to remove all other accounts? The owners of these accounts will need to sign in again to use this device later. Your account will not be affected.', {
			cancelable: true,
			complete: doIt
		})
	} else {
		doIt();
	}
}

function getSavedAccountIndex(name) {
	if (!localStorage.savedAccounts) return undefined;

	const savedAccounts = JSON.parse(localStorage.savedAccounts);
	const index = savedAccounts.findIndex(a => a.name === name);
	return index;
}