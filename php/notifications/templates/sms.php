<?php

$smsTemplates = Array(
    "friendRequest" => function ($fromName) {
        $body = $fromName + ' wants to be your friend on scrabble.colebot.com. Log in to accept!';
        return $body;
    },
    "newGame" => function ($gameName, $gameId, $playerNames) {
        $body = $playerNames[0] + ' created a game on scrabble.colebot.com with you! Log in to play.';
        return $body;
    },
    "nudge" => function ($nudgingPlayerName, $gameName, $gameId, $playerNames) {
        return 'nudge';
    },
    "turn" => function ($prevPlayerName, $gameName, $gameId, $playerNames) {
        return 'turn';
    }
);