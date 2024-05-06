<?php

require "gameCard.php";

function newGameEmail($gameName, $gameId, $playerNames) {
    $body = '
        <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
        <style>
            :root {
                font-family: "Rubik", Helvetica, sans-serif;
            }
        </style>
        <h1><b>' . $playerNames[0] . '</b> just started a new Scrabble game with you!</h1>
        ' . gameCard($gameName, $gameId, $playerNames) . '
        <h2>You\'ll receive another email when it\'s your turn to make your move.</h2>
    ';

    return ["$playerNames[0] added you to a Scrabble game!", $body];
}