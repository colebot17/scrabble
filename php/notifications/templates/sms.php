<?php

$smsTemplates = Array(
    "friendRequest" => function ($fromName) {
        $body = $fromName . ' wants to be your friend. Log on to accept!';
        return $body;
    },
    "newGame" => function ($gameName, $gameId, $playerNames) {
        $withString = 'you';
        if (count($playerNames) === 3) {
            $withString = 'you and 1 other player';
        } else if (count($playerNames) > 3) {
            $withString = 'you and ' . (count($playerNames) - 2) . ' other players';
        }
        $body = $playerNames[0] . ' created a game with ' . $withString . '! Log on to play.';
        return $body;
    },
    "nudge" => function ($nudgingPlayerName, $gameName, $gameId, $playerNames) {
        $body = $nudgingPlayerName . ' nudged you to make your move - ' . ($gameName || '') . '#' . $gameId . '. Log on to play!';
        return $body;
    },
    "turn" => function ($prevPlayerName, $gameName, $gameId, $playerNames) {
        $body = $prevPlayerName . ' moved, and it\'s your turn now! ' . ($gameName || '') . '#' . $gameId . ' - Log on to play!';
        return $body;
    }
);