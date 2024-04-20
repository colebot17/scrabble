<?php

function turnEmail($prevPlayerName, $gameName, $gameId, $playerNames) {
    $gameCardTitleLine = '
        <div><span>
                <b>' . ($gameName !== "" ? $gameName : '#' . strval($gameId)) . '</b>
            </span>' . ($gameName ? '<br><span class="finePrint">#123</span>' : '') . '
        </div>
    ';
    $code = '
        <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
        <style>
            :root {
                --background-0: #F2F5FF;
                --background-1: #6BBAEC;
                --highlight: #FF57BB;
                --text-color: black;
                --text-color-light: #00000066;

                font-family: "Rubik", Helvetica, sans-serif;
                background-color: var(--background-0);
            }
            .gameCard {
                width: 150;
                height: 300;
                background-color: var(--background-1);
                border-radius: 10px;
                padding: 10px;
                text-align: center;
                display: inline-block;
                border: 3px solid var(--highlight);
            }
            .playButton {
                height: auto;
                width: 100%;
                background-color: var(--highlight);
                color: var(--text-color);
                text-decoration: none;
                padding: 5px;
                border-radius: 5px;
                display: inline-block;
                box-sizing: border-box;
            }
            .finePrint {
                font-size: small;
                color: var(--text-color-light);
            }
            h1 {
                margin-bottom: 5px;
            }
            h2 {
                margin-top: 5px;
            }
        </style>
        <h1><b>' . $prevPlayerName . '</b> made their move</h1>
        <div class="gameCard">
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
            <a class="playButton" href="https://scrabble.colebot.com?game=' . strval($gameId) . '">Play</a>
        </div>
    ';

    return $code;
}