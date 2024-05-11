<?php

function friendRequestEmail($name) {
    $body = '
        <link href="https://fonts.googleapis.com/css2?family=Rubik" rel="stylesheet">
        <style>
            :root {
                font-family: "Rubik", Helvetica, sans-serif;
            }
        </style>
        <h1><b>' . $name . '</b> just requested to be your friend on scrabble!</h1>
        <h3>Visit <a href="https://scrabble.colebot.com">scrabble.colebot.com</a> to accept their request.</h3>
    ';

    return ["$name wants to be your friend!", $body];
}