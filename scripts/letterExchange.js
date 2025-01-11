function exchangeLetters() {
	// do some preliminary checks
	if (!account.id) {
		textModal("Error", "You must be signed in to skip your turn.");
		return;
	}
	if (!game) {
		textModal("Error", "You must be in a game to skip your turn.");
		return;
	}
	if (game.inactive) {
		textModal("Error", "You cannot skip your turn in an inactive game.");
		return;
	}
	if (game.players[parseInt(game.turn) % game.players.length].id != account.id) {
		textModal("Error", "You cannot skip your turn when it is not your turn.");
		return;
	}

	// show the letter bank in the letter exchange modal
	const letterBank = document.getElementById('letterExchangeBank');
	letterBank.innerHTML = '';

	if (game.lettersLeft <= 0) {
		skipTurn();
		return;
	}

	const letterExchangeButton = document.getElementById('letterExchangeButton');
	letterExchangeButton.innerText = 'Skip Turn';
	const bank = game.players[game.currentPlayerIndex].letterBank;
	for (let i in canvas.bankOrder) {
		letterBank.innerHTML += /* html */ `
			<button class='letter' data-bankindex='${canvas.bankOrder[i]}' aria-pressed='false'>
				<span class='letterLetter'>${bank[canvas.bankOrder[i]] ? bank[canvas.bankOrder[i]] : ``}</span>
				<span class='letterPoints'>${bank[canvas.bankOrder[i]] ? langInfo[game.lang].letterScores[bank[canvas.bankOrder[i]]] : ``}</span>
			</button>
		`;
	}

	const letters = letterBank.children;
	for (let el of letters) {
		el.addEventListener('click', () => {
			const isSelected = el.getAttribute('aria-pressed') === "true";
			const allSelected = letterBank.querySelectorAll('[aria-pressed=true]');
			if (!isSelected && allSelected.length >= game.lettersLeft) {
				const plural = game.lettersLeft !== 1;
				textModal(
					'Max Letters Reached',
					`There ${plural ? "are" : "is"} only ${game.lettersLeft} letter${plural ? "s" : ""} left in the bag. Deselect another letter before selecting this one.`
				);
			} else {
				el.setAttribute('aria-pressed', !isSelected);
				const newAllSelected = letterBank.querySelectorAll('[aria-pressed=true]');
				letterExchangeButton.textContent = `
					${newAllSelected.length > 0
						? `
						Exchange ${
							newAllSelected.length >= bank.length
							? `All`
							: newAllSelected.length
						} Letter${
							newAllSelected.length === 1
							? ``
							: `s`
						} and `
						: ``
					}Skip Turn
				`;
			}
		});
	}

	$('#letterExchangeModal').modalOpen();
}

function skipTurn() {
	let letterExchangeEls = document.querySelectorAll("#letterExchangeBank [aria-pressed=true]");

	let letterExchangeIndices = [];
	for (let el of letterExchangeEls) {
		letterExchangeIndices.push(el.dataset.bankindex);
	}

	let num = letterExchangeIndices.length;

	textModal(
		`Skip Turn${num > 0 ? ` and Exchange Letter${num === 1 ? `` : `s`}` : ``}`,
		`Are you sure you want to ${num > 0 ? `exchange ${num >= 7 ? `all ` : ``}${num} letter${num === 1 ? `` : `s`} and ` : ``}forfeit your turn?`
		+ (game.lettersLeft <= 0 ? "<br><br>You cannot exchange any letters since there are no letters left in the bag." : ""),
		{
			cancelable: true,
			complete: async () => {
				let res = await request('skipTurn.php', {
					user: account.id,
					pwd: account.pwd,
					game: game.id,
					redrawLetters: JSON.stringify(letterExchangeIndices)
				});

				if (res.errorLevel > 0) {
					textModal("Error", res.message);
					return;
				}

				if (res.status === 1) { // if the game has ended
					// calculate the winner indices
					let winPts = 0;
					for (let i = 0; i < game.players.length; i++) {
						if (game.players[i].points > winPts) winPts = game.players[i].points;
					}
					let winds = [];
					for (let i = 0; i < game.players.length; i++) {
						if (game.players[i].points === winPts) winds.push(i);
					}

					showEndGameScreen({
						reason: "skip",
						gameDeleted: res.completelyDeleted,
						winnerIndices: winds
					});
				} else {
					// display the exchange/skip confirmation
					if (letterExchangeIndices.length && res.newLetters.length) {
						const bank = game.players[game.currentPlayerIndex].letterBank;
						let diagram = `<div class="flex">`;
						for (let i = 0; i < letterExchangeIndices.length; i++) {
							const letter = bank[letterExchangeIndices[i]];
							diagram += `<div class="tile">${letter}`;

							const score = langInfo?.[game.lang]?.letterScores?.[letter];
							if (score) {
								diagram += `<div class="tilePoints">${score}</div>`;
							}

							diagram += `</div>`;
						}
						diagram += `</div>&darr;<div class="flex">`;
						for (let i = 0; i < res.newLetters.length; i++) {
							const letter = res.newLetters[i]["letter"];
							diagram += `<div class="tile yellowOutline">${letter}`;

							const score = langInfo?.[game.lang]?.letterScores?.[letter];
							if (score) {
								diagram += `<div class="tilePoints">${score}</div>`;
							}

							diagram += `</div>`;
						}
						diagram += `</div>`;

						textModal("Letters Exchanged", res.message + `<br><br>` + diagram);
					} else {
						textModal("Turn Skipped", res.message);
					}

					loadGame(game.id).then(() => {
						for (let i = 0; i < res.newLetters.length; i++) {
							canvas.bank[res.newLetters[i]["index"]].highlight = true;
						}
					});
					
					// update the game in the game list
					const g = account.games.find(a => a.id === game.id);
					if (res.status === 1) {
						g.inactive = true;
					} else {
						g.turn++;
					}
					g.lastUpdate = new Date();

					updateGamesList(); // show the changes
				}

				$('#letterExchangeModal').modalClose();
			}
		}
	);
}