$(function() {
	// auto sign in
	if (sessionStorage.name && sessionStorage.pwd) {
		signIn(sessionStorage.name, sessionStorage.pwd);
		$('#scrabbleGrid').attr('data-signedin', "loading");
	} else if (localStorage.name && localStorage.pwd) {
		signIn(localStorage.name, localStorage.pwd);
		$('#scrabbleGrid').attr('data-signedin', "loading");
	} else {
		setSignInMode('signIn');
		$('#scrabbleGrid').attr('data-signedin', "false");
	}
});

var account = {};

function setSignInMode(mode) {
	const backButtonKey = {
		settings: "signOut",
		changePassword: "settings",
		changeUsername: "settings",
		accountSwitcher: "settings",
		signIn: "accountSwitcher"
	};

	let $signInCell = $('#signInCell');
	if (!mode) { // go back if no argument is supplied
		let currentMode = $signInCell.attr('data-mode');
		mode = backButtonKey[currentMode];
	}

	$signInCell.off();
	$('#signInCell .accountForm').addClass('hidden');
	const action = $('#signInCell #' + mode + 'Form').removeClass('hidden').attr('data-action');
	$signInCell.on('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (action) window[action]();
		}
	});
	
	removeFromEscStack('signInMode_' + mode);

	if (backButtonKey[mode]) {
		addToEscStack(() => {
			setSignInMode(backButtonKey[mode]);
		}, 'signInMode_' + backButtonKey[mode]);
	}
}

function signIn(name = $('#signInUsername').val(), pwd = $('#signInPwd').val()) {
	const formEl = document.getElementById('signInForm');
	const usernameField = document.getElementById('signInUsername');
	const pwdField = document.getElementById('signInPwd');
	const submitButton = document.getElementById('signInSubmitButton');

	// disable form elements while we are working
	usernameField.disabled = true;
	pwdField.disabled = true;
	submitButton.disabled = true;

	// show the loading screen
	const scrabbleGrid = document.getElementById('scrabbleGrid');
	scrabbleGrid.dataset.signedin = "loading";
	const loaderVideo = document.getElementById('shuffleLoader');
	loaderVideo.currentTime = 0;
	loaderVideo.play();

	var req = request('signIn.php', {name, pwd});
	var timer = new Promise(resolve => {
		setTimeout(resolve, 740);
	});

	Promise.all([req, document.fonts.ready, timer]).then(values => {
		res = values[0];

		// if there has been an error (incorrect name/pwd),
		if (res.errorLevel > 0) {
			textModal("Error", res.message, {
				complete: function() {
					// set up the form
					setSignInMode('signIn');

					// re-enable fields
					usernameField.disabled = false;
					pwdField.disabled = false;
					submitButton.disabled = false;
					
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
			loaderVideo.pause();

			return;
		}
		account.name = res.data.name;
		account.pwd = pwd;
		account.id = parseInt(res.data.id);
		account.games = res.data.games;
		account.friends = res.data.friends;
		account.requests = res.data.requests;
		account.sentRequests = res.data.sentRequests;

		localStorage.name = res.data.name;
		localStorage.pwd = pwd;
		sessionStorage.name = res.data.name;
		sessionStorage.pwd = pwd;

		const label = document.getElementById('accountNameLabel');

		label.textContent = res.data.name;
		label.innerHTML = "<b>" + label.textContent + "</b>";

		formEl.reset();
		setSignInMode('signOut');

		saveAccount(res.data.name, pwd);
		updateSavedAccountList();

		updateGamesList();
		
		updateFriendsList(account.friends);
		updateRequestList(account.requests);
		updateSentRequestList(account.sentRequests);

		// show the signed in page
		scrabbleGrid.dataset.signedin = "true";
		loaderVideo.pause();
	}).catch(err => {
		console.error("Sign-in could not be completed:", err);
		setSignInMode('signIn');
		
		scrabbleGrid.dataset.signedin = "false";
	});
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

	$.ajax(
		location + '/php/createAccount.php',
		{
			data: {
				name,
				pwd
			},
			method: "POST",
			success: function(data) {
				const jsonData = JSON.parse(data);
				if (jsonData.errorLevel > 0) {
					textModal("Error", jsonData.message);
					return;
				}
				signIn(name, pwd);
			},
			error: function() {
				console.error("Could not create account.");
			}
		}
	);
}

function changePassword(
	pwd = document.getElementById('changePasswordPwd').value,
	newPwd = document.getElementById('changePasswordNewPwd').value,
	newPwdConfirm = document.getElementById('changePasswordConfirmNewPwd').value
) {
	if (newPwd !== newPwdConfirm) {
		textModal('Error', 'The passwords must match');
		return;
	}

	textModal('Change Password', 'Are you sure you want to change your password? You will be signed out of all devices, and you will lose the ability to sign in using your old password.', {
		cancelable: true,
		complete: () => {
			$.ajax(
				location + '/php/changePassword.php',
				{
					data: {
						user: account.id,
						pwd,
						newPwd
					},
					method: "POST",
					success: function(data) {
						const jsonData = JSON.parse(data);
						if (jsonData.errorLevel > 0) {
							textModal("Error", jsonData.message);
							return;
						}
						signIn(account.name, newPwd);
						textModal("Change Password", "Password changed.");
					},
					error: function() {
						textModal("Unknown Error", "Could not change password.")
						console.error("Could not change password.");
					}
				}
			);
		}
	});
}

function changeUsername(
	pwd = document.getElementById('changeUsernamePwd').value,
	newName = document.getElementById('changeUsernameNewName').value
) {
	textModal('Change Username', 'Are you sure you want to change your username? This action will change how others see you across the site.', {
		cancelable: true,
		complete: () => {
			$.ajax(
				location + '/php/changeUsername.php',
				{
					data: {
						user: account.id,
						pwd,
						newName
					},
					method: "POST",
					success: function(data) {
						const jsonData = JSON.parse(data);
						if (jsonData.errorLevel > 0) {
							textModal("Error", jsonData.message);
							return;
						}
						signIn(newName, account.pwd);
						textModal('Change Username', jsonData.message);
					}
				}
			)
		}
	})
}

function signOut(confirm = true, saveAccount = false) {
	function doIt() {
		if (!saveAccount && localStorage.savedAccounts) {
			const savedAccounts = JSON.parse(localStorage.savedAccounts);
			const index = savedAccounts.findIndex(a => a.name === account.name);
			removeSavedAccount(index, false);
		}
		localStorage.removeItem('name');
		localStorage.removeItem('pwd');
		sessionStorage.removeItem('name');
		sessionStorage.removeItem('pwd');
		location.reload();
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
				<span class="accountName">${savedAccounts[i].name}${isCurrent ? ` (You)` : ``}</span>
				<button class="iconTextButton accountSignInButton noMargin semiHighlight" onclick="signIn('${savedAccounts[i].name}', '${savedAccounts[i].pwd}')"${isCurrent ? ` disabled` : ``}>
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