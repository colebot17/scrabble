$(function() {
	if (localStorage.name && localStorage.pwd) {
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
		accountSwitcher: "settings"
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
	return $.ajax(
		location + '/php/signIn.php',
		{
			data: {
				name,
				pwd
			},
			method: "POST",
			success: function(data) {
				const jsonData = JSON.parse(data);

				// if there has been an error,
				if (jsonData.errorLevel > 0) {
					textModal("Error", jsonData.message);
					setSignInMode('signIn');

					// show the sign-in page
					document.getElementById('scrabbleGrid').dataset.signedin = 'false';

					// clear localStorage
					localStorage.removeItem('name');
					localStorage.removeItem('pwd');

					// clear the form
					document.getElementById('signInForm').reset();

					return;
				}
				account.name = jsonData.data.name;
				account.pwd = pwd;
				account.id = parseInt(jsonData.data.id);
				account.games = JSON.parse(jsonData.data.games);

				localStorage.name = jsonData.data.name;
				localStorage.pwd = pwd;

				const label = document.getElementById('accountNameLabel');
				
				label.textContent = jsonData.data.name;
				label.innerHTML = "<b>" + label.textContent + "</b>";

				setSignInMode('signOut');

				saveAccount(jsonData.data.name, pwd);
				updateSavedAccountList();

				$('#scrabbleGrid').attr('data-signedin', "true");

				updateGamesList();
			},
			error: function() {
				console.error("Sign-in could not be completed.");
				setSignInMode('signIn');
			}
		}
	);
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

function signOut(rem) {
	textModal("Sign Out", "Are you sure you want to sign out?", {
		cancelable: true,
		complete: () => {
			if (rem) removeSavedAccount(rem);
			localStorage.removeItem('name');
			localStorage.removeItem('pwd');
			location.reload();
		}
	});
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
		<button class="account addSavedAccountButton" onclick="signOut()">
			<span class="material-symbols-rounded largeIcon">add</span>
		</button>
	`;
}

function saveAccount(name, pwd) {
	// save an account into local storage
	const savedAccounts = localStorage.savedAccounts ? JSON.parse(localStorage.savedAccounts) : [];
	if (savedAccounts.find(a => a.name === name)) return;
	savedAccounts.push({name, pwd});
	localStorage.savedAccounts = JSON.stringify(savedAccounts);
}

function removeSavedAccount(index) {
	const savedAccounts = JSON.parse(localStorage.savedAccounts);
	// remove a specific account from local storage (after confirmation)
	textModal('Remove Saved Account', `Are you sure you want to remove this account? <b>${savedAccounts[index].name}</b> will have to sign in again if they want to use this device later.`, {
		cancelable: true,
		complete: function() {
			savedAccounts.splice(index, 1)[0].name;
			localStorage.savedAccounts = JSON.stringify(savedAccounts);
			updateSavedAccountList();
		}
	})
}