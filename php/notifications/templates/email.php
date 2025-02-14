<?php

$emailTemplates = Array(
    "test" => function () {
        $body = '
            <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
            <style>
                :root {
                    font-family: "Rubik", Helvetica, sans-serif;
                }
            </style>
            <h1>Testing</h1>
            <p>This is a test of the scrabble notification system. You may disregard this message.</p>
        ';

        return ["Test Email", $body];
    },
    "friendRequest" => function ($fromName) {
        $body = '
            <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
            <style>
                :root {
                    font-family: "Rubik", Helvetica, sans-serif;
                }
            </style>
            <h1><b>' . $fromName . '</b> just requested to be your friend on scrabble!</h1>
            <h3>Visit <a href="https://scrabble.colebot.com">scrabble.colebot.com</a> to accept their request.</h3>
        ';

        return ["$fromName wants to be your friend!", $body];
    },
    "newGame" => function ($gameName, $gameId, $playerNames) {
        require_once "gameCard.php";
        $gameCard = gameCard($gameName, $gameId, $playerNames, false);
        $firstName = $playerNames[0];
        $body = '
            <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
            <style>
                :root {
                    font-family: "Rubik", Helvetica, sans-serif;
                }i
            </style>
            <h1><b>' . $firstName . '</b> just started a new Scrabble game with you!</h1>
            ' . $gameCard . '
            <h2>You\'ll receive another notification when it\'s your turn to play.</h2>
        ';
    
        return ["$firstName added you to a Scrabble game!", $body];
    },
    "nudge" => function ($nudgingPlayerName, $gameName, $gameId, $playerNames) {
        require_once "gameCard.php";
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
    },
    "turn" => function ($prevPlayerName, $gameName, $gameId, $playerNames) {
        require_once "gameCard.php";
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
    },
    "endGame" => function ($playerName, $gameName, $gameId, $playerNames) {
        require_once "gameCard.php";
        $playLink = 'https://scrabble.colebot.com?game=' . $gameId;
        $gameCard = gameCard($gameName, $gameId, $playerNames, false);
        $body = '
            <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
            <style>
                :root {
                    font-family: "Rubik", Helvetica, sans-serif;
                }
            </style>
            <h1><b>' . $playerName . '</b> wants to end this game<h1>
            ' . $gameCard . '
            <h2>If you want to end it too, log on to vote</h2>
            <p>Otherwise, the game will remain active</p>
        ';
    }
);