<?php

require "gameCard.php";

function turnEmail($prevPlayerName, $gameName, $gameId, $playerNames) {
    $playLink = 'https://scrabble.colebot.com?game=' . $gameId;
    $gameCard = gameCard($gameName, $gameId, $playerNames);
    $body = '
        <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
        <style>
            :root {
                font-family: "Rubik", Helvetica, sans-serif;
            }
        </style>
        <h1><b>' . $prevPlayerName . '</b> just moved on Scrabble!</h1>
        ' . $gameCard . '
        <h2>It\'s your turn now, so go make your move!</h2>
        <p>Alternatively, copy and paste this link into your browser:<br>' . $playLink . '</p>
    ';

    return ["It's your turn on Scrabble!", $body];
}