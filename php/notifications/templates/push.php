<?php

$smsTemplates = Array(
    "confirmation" => function ($un, $number, $user) {
        $title = "Method Added";
        $text = "You will now receive notifications from scrabble on this device";
        return Array($title, $text);
    },
    "friendRequest" => function ($fromName) {
        $title = "New Friend Request";
        $text = $fromName . ' wants to be your friend. Log on to accept!';
        return Array($title, $text);
    },
    "newGame" => function ($gameName, $gameId, $playerNames) {
        $title = "New Game Started";
        $withString = 'you';
        if (count($playerNames) === 3) {
            $withString = 'you and 1 other player';
        } else if (count($playerNames) > 3) {
            $withString = 'you and ' . (count($playerNames) - 2) . ' other players';
        }
        $text = $playerNames[0] . ' started a game with ' . $withString . '! Log on to play.';
        return Array($title, $text);
    },
    "nudge" => function ($nudgingPlayerName, $gameName, $gameId, $playerNames) {
        $title = "$nudgingPlayerName nudged you!";
        $text = $nudgingPlayerName . ' wants you to move in ' . ($gameName || 'game') . ' #' . $gameId . '. Log on to play!';
        return Array($title, $text);
    },
    "turn" => function ($prevPlayerName, $gameName, $gameId, $playerNames) {
        $title = "It's Your Turn!";
        $text = $prevPlayerName . ' moved in ' . ($gameName !== '' ? $gameName : 'game ') . '#' . $gameId . ', and it\'s your turn now! Log on to play.';
        return Array($title, $text);
    }
);