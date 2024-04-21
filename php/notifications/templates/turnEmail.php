<?php

function turnEmail($prevPlayerName, $gameName, $gameId, $playerNames) {
    $playLink = 'https://scrabble.colebot.com?game=' . $gameId;
    $gameCardTitleLine = '
        <div><span>
                <b>' . ($gameName !== "" ? $gameName : '#' . strval($gameId)) . '</b>
            </span>' . ($gameName ? '<br><span class="finePrint" style="font-size:small;color:#00000066;">#' . strval($gameId) . '</span>' : '') . '
        </div>
    ';
    $code = '
        <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
        <style>
            :root {
                font-family: "Rubik", Helvetica, sans-serif;
                background-color: var(--background-0);
            }
        </style>
        <h1><b>' . $prevPlayerName . '</b> made their move on Scrabble!</h1>
        <div class="gameCard" style="min-width:150px;background-color:#6BBAEC;border-radius:10px;padding:10px;text-align:center;display:inline-block;border:3px solid #FF57BB;">
            ' . $gameCardTitleLine . '
            <br>
            <div>';

            for ($i = 0; $i < count($playerNames); $i++) {
                if ($i !== 0) $code .= '<br>';
                $code .= '<span>' . $playerNames[$i] . '</span>';
            }

        $code .= '
            </div>
            <br>
            <a class="playButton" href="' . $playLink . '" style="height:auto;width:100%;background-color:#FF57BB;color:black;text-decoration:none;padding:5px;border-radius:5px;display:inline-block;box-sizing:border-box;">Play</a>
        </div>
        <h2>It\'s your turn now, so go make your move!</h2>
        <p>Alternatively, copy and paste this link into your browser:<br>' . $playLink . '</p>
        <p>You are receiving this email because you signed up for notifications on <a href="https://scrabble.colebot.com">scrabble.colebot.com</a>.</p>
    ';

    return $code;
}