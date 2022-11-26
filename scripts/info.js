function getInfo() {
    // common info calculations
    const name = game.name;
    const id = game.id;
    const creationDate = game.creationDate;
    const creationDateValid = creationDate !== '0000-00-00';
    const startPlayer = game.players[0].name;
    const totalTurn = game.turn;

    // common info lines
    const nameLine = /* html */ `
        <b>
            ${name ?? '#' + id}
            ${name ? /* html */ `
                &nbsp;
                <span class="finePrint">
                    #${id}
                </span>
            ` : ``}
        </b>
    `;
    
    const creationLine = /* html */ `
        Created &nbsp;
        ${creationDateValid ? /* html */ `
            on
            &nbsp; <b>
                ${creationDate}
            </b> &nbsp;
        ` : ``}
        by
        &nbsp; <b>
            ${startPlayer}
        </b>
    `;

    let message;
    if (!game.inactive) {
        // active info calculations
        const lettersLeft = game.lettersLeft;
        const turnPlayer = game.players[game.turn % game.players.length].name;

        // active info lines
        const turnLine = /* html */ `
            Turn
            &nbsp; <b>
                ${totalTurn}
            </b>:
            &nbsp; <b>
                ${turnPlayer}
            </b>'s turn
        `;

        const letterBagLine = /* html */ `
            <b>
                ${lettersLeft}
            </b> &nbsp;
            letters left in bag
        `;

        // active info message
        message = /* html */ `
            <div class="flex col" style="gap: 5px">
                <div>${nameLine}</div>
                <div>${creationLine}</div>
                <div>${turnLine}</div>
                <div>${letterBagLine}</div>
            </div>
        `;
    } else {
        // inactive info calculations

        // calculate winner
        let winner = "No one", winnerPoints = 0;
        for (let i in game.players) {
            if (game.players[i].points > winnerPoints) {
                winnerPoints = game.players[i].points;
                winner = game.players[i].name;
            } else if (game.players[i].points === winnerPoints) {
                winner += '</b> and <b>' + game.players[i].name;
            }
        }

        // calculate start date
        const startDate = new Date(0);
        startDate.setFullYear(creationDate.slice(0, 4));
        startDate.setMonth(creationDate.slice(5, 7));
        startDate.setDate(creationDate.slice(8, 10));

        // calculate end date
        const endDateString = game.endDate;
        const endDateValid = endDateString !== '0000-00-00';
        const endDate = new Date(0);
        endDate.setFullYear(endDateString.slice(0, 4));
        endDate.setMonth(endDateString.slice(5, 7));
        endDate.setDate(endDateString.slice(8, 10));

        // calculate total days (if start date and end date are available)
        let days = null;
        if (startDate.getTime && endDate.getTime && creationDateValid && endDateValid) {
            days = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000); // number of milliseconds in a day
        }

        // inactive info lines
        const winnerLine = /* html */ `
            <b>
                ${winner}
            </b> &nbsp;
            won with
            &nbsp; <b>
                ${winnerPoints}
            </b> &nbsp;
            points
        `;

        let endLine;
        if (endDateValid) {
            endLine = /* html */ `
                Ended on
                &nbsp; <b>
                    ${endDateString}
                </b> &nbsp;
                ${days !== null ? /* html */ `
                    in
                    &nbsp; <b>
                        ${days}
                    </b> &nbsp;
                ` : ``}
                with
                &nbsp; <b>
                    ${totalTurn}
                </b> &nbsp;
                moves
            `;
        } else {
            endLine = /* html */ `
                Moves:
                &nbsp; <b>
                    ${totalTurn}
                </b>
            `;
        }
        

        // inactive info message
        message = /* html */ `
            <div class="flex col" style="gap: 5px">
                <div>${nameLine}</div>
                <div>${creationLine}</div>
                <div>${winnerLine}</div>
                <div>${endLine}</div>
            </div>
        `
    }
    

    textModal('Info', message);
}