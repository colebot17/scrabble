<?php

require "gameCard.php";

function nudgeEmail($nudgingPlayerName, $nudgedPlayerName, $gameName, $gameId, $playerNames) {
    $gameCard = gameCard($gameName, $gameId, $playerNames);

    $body = '
        <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
        <style>
            :root {
                font-family: "Rubik", Helvetica, sans-serif;
            }
        </style>
        <h1><b>' . $nudgingPlayerName . '</b> wants you to move on Scrabble!</h1>
        ' . $gameCard . '
        <h2>Don\'t make them wait any longer! Go make your move!</h2>
    ';

    return ["$nudgingPlayerName nudged you!", $body];
}