$(function() {
	if (localStorage.name && localStorage.pwd) {
		signIn(localStorage.name, localStorage.pwd);
	} else {
		setSignInMode('signIn');
	}
});

var account = {};

function setSignInMode(mode) {
	var $signInCell = $('#signInCell');
	$signInCell.off('keyup');
	if (mode === 'signIn') { // sign in
		$('#signInCell .accountForm').addClass('hidden');
		$('#signInCell #signInForm').removeClass('hidden');
		$signInCell.on('keyup', function(e) {
			if (e.key === 'Enter') {
				signIn();
			}
		});
	} else if (mode === 'createAccount') { // create account
		$('#signInCell .accountForm').addClass('hidden');
		$('#signInCell #createAccountForm').removeClass('hidden');
		$signInCell.on('keyup', function(e) {
			if (e.key === 'Enter') {
				createAccount();
			}
		});
	} else if (mode === 'signOut') { // sign out
		$('#signInCell .accountForm').addClass('hidden');
		$('#signInCell #signOutForm').removeClass('hidden');
		$signInCell.on('keyup', function(e) {
			if (e.key === 'Enter') {
				signOut();
			}
		});
	} else {
		console.warn(`Failed to set sign-in mode: Mode ${mode} not recognized.`);
	}
}

function signIn(name = $('#signInUsername').val(), pwd = $('#signInPwd').val()) {
	$.ajax(
		'signIn.php',
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

				$('#scrabbleGrid').attr('data-signedin', true);

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
		'createAccount.php',
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

function signOut() {
	textModal("Sign Out", "Are you sure you want to sign out?", true, function() {
		localStorage.removeItem('name');
		localStorage.removeItem('pwd');
		location.reload();	
	});
}