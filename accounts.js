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
		'http://scrabble.colebot.com/signIn.php',
		{
			data: {
				name,
				pwd
			},
			method: "POST",
			success: function(data) {
			// 	var tab = window.open('about:blank', '_blank');
			// 	tab.document.write(data);
				if (data !== '0') {
					var pData = JSON.parse(data);
					account.name = pData.name;
					account.pwd = pwd;
					account.id = parseInt(pData.id);
					account.games = JSON.parse(pData.games);

					localStorage.name = pData.name;
					localStorage.pwd = pwd;

					$('#accountNameLabel').text(pData.name);
					
					setSignInMode('signOut');

					$('#scrabbleGrid').attr('data-signedin', true);

					updateGamesList();
				} else {
					textModal("Incorrect username or password");
					setSignInMode('signIn');

					// clear the form
					document.getElementById('signInForm').reset();
				}
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
		'http://scrabble.colebot.com/createAccount.php',
		{
			data: {name: name, pwd: pwd},
			method: "POST",
			success: function(data) {
				if (data !== '0') {
					signIn(name, pwd);
				} else {
					alert("An account by that name already exists.");
				}
			},
			error: function() {
				console.error("Request could not be completed.");
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