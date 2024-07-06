<?php

$smsTemplates = Array(
    "confirmation" => function ($un, $number, $user) {
        $body = 'This number (+1' . $number . ') has been added as a notification method for ' . $un . '.';
        return $body;
    },
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
        $body = $playerNames[0] . ' started a game with ' . $withString . '! Log on to play.';
        return $body;
    },
    "nudge" => function ($nudgingPlayerName, $gameName, $gameId, $playerNames) {
        $body = $nudgingPlayerName . ' nudged you to make your move - ' . ($gameName || '') . '#' . $gameId . '. Log on to play!';
        return $body;
    },
    "turn" => function ($prevPlayerName, $gameName, $gameId, $playerNames) {
        $body = $prevPlayerName . ' moved in ' . ($gameName !== '' ? $gameName : 'game ') . '#' . $gameId . ', and it\'s your turn now! Log on to play.';
        return $body;
    }
);