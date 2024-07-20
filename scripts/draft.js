function loadDraft() {
	if (!game.draft) return;

	for (let i = 0; i < game.draft.length; i++) {
		const dl = game.draft[i];
		if (!game.board?.[dl.pos[1]]?.[dl.pos[0]]) {
			addLetter(...dl.pos, dl.bankIndex, dl.letter);
		}
	}

    checkPoints();
}

function saveDraft(tiles) {
    if (!game.id) return;

    request('draft/saveDraft.php', {
        user: account.id,
        pwd: account.pwd,
        game: game.id,
        tiles: JSON.stringify(tiles)
    });
}

function removeDraft() {
    if (!game.id) return;
    request('draft/removeDraft.php', {
        user: account.id,
        pwd: account.pwd,
        game: game.id
    });

    // make sure the draft is not shown in the move history
    updateMoveHistory();
}