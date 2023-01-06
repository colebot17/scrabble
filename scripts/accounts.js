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
	let $signInCell = $('#signInCell');
	$signInCell.off();
	$('#signInCell .accountForm').addClass('hidden');
	const action = $('#signInCell #' + mode + 'Form').removeClass('hidden').attr('data-action');
	$signInCell.on('keydown', (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			window[action]();
		}
	});
}

function signIn(name = $('#signInUsername').val(), pwd = $('#signInPwd').val()) {
	$.ajax(
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

				$('#accountNameLabel').text(jsonData.data.name);
				
				setSignInMode('signOut');

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
				location + '/php/changePassword.php',
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
						showTab('account');
						setSignInMode('signOut');
						loadGamesList();
						textModal('Change Username', jsonData.message);
					}
				}
			)
		}
	})
}

function signOut() {
	textModal("Sign Out", "Are you sure you want to sign out?", {
		cancelable: true,
		complete: () => {
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