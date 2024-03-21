<?php

function aiMove($conn, $gameId) {
    
    // get necessary information about the game
    $sql = "SELECT lang, board, players FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);

    $lang = $row['lang'];
    $board = json_decode($row['board'], true);
    $players = json_decode($row['players'], true);
    for ($i = 0; $i < count($players); $i++) {
        if ($players[$i]['id'] === 0) {
            $botPlayer = $players[$i];
        }
    }
    $letterBank = $botPlayer['letterBank'];
    
    $dictionary = json_decode(file_get_contents('../resources/dictionary_' . $lang . '.json'), true)["words"];

    $newDictionary = Array();

    $tryCount = 3;
    if (array_key_exists('trys', $_GET)) {
        $tryCount = $_GET['trys'];
    }
    
    for ($i = 0; $i < $tryCount; $i++) {

        $bankCopy = Array();
        for ($j = 0; $j = count($letterBank); $j++) {
            $bankCopy[] = $letterBank[$j];
        }

        $word = $dictionary[rand(0, count($dictionary))];

        echo 'Trying word: ' . $word . '<br>';

        $otherLetters = 0;

        for ($j = 0; $j < count($word); $j++) {
            if (in_array(strtoupper($word[$j]), $bankCopy)) {
                unset($bankCopy[array_search($word[$j], $bankCopy)]);
            } else {
                $otherLetters++;
            }
        }

        if ($otherLetters <= 1) {
            $newDictionary[] = $word;
            echo 'Succeeded!<br><br>';
        } else {
            echo 'Failed. :(<br><br>';
        }

    }

    var_dump($newDictionary);
}

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$gameId = 627;

aiMove($conn, $gameId);