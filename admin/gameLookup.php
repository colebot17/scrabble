<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Lookup - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Game Lookup</h1>
    <?php

    // for displaying chat messages
    require_once __DIR__ . '/../php/util/decodeURIComponent.php';

    $gameId = $_GET['gameId'];

    require_once(__DIR__ . "/../php/util/getConn.php");
    $conn = getConn();

    $sql = "SELECT name, lang, players, turn, letterBag, inactive, creationDate, endDate, chat FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no game with an id of ' . $gameId . '</h2>';
        exit();
    }

    echo '<h2>' . $row['name'] . ' <span style="color:gray">#' . $gameId . '</span></h2>';

    echo '<p>';

    echo '<a href="renameGame.php?gameId=' . $gameId . '">Rename Game</a>';
    echo '<br><br>';

    $inactive = $row['inactive'];
    if ($inactive) {
        echo '<span style="color:red">Inactive</span><br>';
    } else {
        echo 'Active<br>';
    }

    $lang = $row['lang'];
    echo 'Language: ' . ucfirst($lang) . '<br>';

    $turn = $row['turn'];
    echo 'Turn: ' . $turn . '<br>';

    echo 'Start Date: ' . ($row['creationDate'] !== '0000-00-00' ? $row['creationDate'] : '<span style="color:gray">[Unknown]</span>') . '<br>';
    if ($inactive) echo 'End Date: ' . ($row['endDate'] !== '0000-00-00' ? $row['endDate'] : '<span style="color:gray">[Unknown]</span>') . '<br>';

    echo '<br>Letter Bag: ';
    $letterBag = json_decode($row['letterBag'], true);
    $letterBag['_'] = $letterBag[''];
    unset($letterBag['']);
    for ($i = 0; $i < count($letterBag); $i++) echo ($i === 0 ? '' : ', ') . '<b>' . array_keys($letterBag)[$i] . '</b>-' . array_values($letterBag)[$i];
    echo '<br><a href="editLetterBag.php?gameId=' . $gameId . '">Edit Letter Bag</a><br><br>';
    if (!$inactive) echo '<a href="archiveGame.php?game=' . $gameId . '">Archive Game</a><br>';
    if ($inactive) echo '<a href="restoreGame.php?game=' . $gameId . '">Restore Game</a><br>';
    echo '<a style="color:red" href="deleteGame.php?game=' . $gameId . '">Delete Game</a>';

    echo '</p>';

    $chat = json_decode($row['chat'], true);

    echo '<h4>Players</h4>';

    $players = json_decode($row['players'], true);

    require "templates.php";

    $nameCache = Array();

    echo '<ul>';
    for ($i = 0; $i < count($players); $i++) {
        $id = $players[$i]['id'];

        $sql = "SELECT name FROM accounts WHERE id='$id'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) continue;

        $name = $row['name'];

        echo '<li>';
        if (!$inactive && $turn % count($players) === $i) echo '<u>';
        if (array_key_exists('endGameRequest', $players[$i]) && $players[$i]['endGameRequest']) echo '<span style="color:red">[EndGameRequest]</span> ';
        echo playerLine($id, $nameCache, $conn);
        if (!$inactive && $turn % count($players) === $i) echo '</u>';

        echo '<ul>';
        echo '<li>Points: ' . $players[$i]['points'] . '</li>';

        echo '<li>Letter Bank: ';
        $letterBank = $players[$i]["letterBank"];
        if (array_key_exists('bankOrder', $players[$i])) {
            $bankOrder = $players[$i]['bankOrder'];
        } else {
            $bankOrder = count($letterBank) > 0 ? range(0, count($letterBank) - 1) : Array();
        }
        for ($j = 0; $j < count($bankOrder); $j++) {
            $letter = $letterBank[$bankOrder[$j]];
            if ($letter === "") echo '_';
            echo $letter . ' ';
        }
        if (count($letterBank) === 0) echo '<span style="color:gray">[Empty]</span>';
        echo '</li>';

        echo '</ul>';


        echo '</li>';
    }
    echo '</ul><br><br>';

    echo '<h4>Chat</h4><ul>';
    for ($i = 0; $i < count($chat); $i++) {
        if ($chat[$i]["type"] === "user") {
            echo '<li>';
            echo '<b>' . $nameCache[(int)$chat[$i]["sender"]] . '</b>: ' . decodeURIComponent($chat[$i]["message"]);
            if (array_key_exists('deleted', $chat[$i]) && $chat[$i]["deleted"]) {
                echo ' <span style="color:red">[Deleted]</span>';
            }
            echo '</li>';
        } else {
            echo '<li style="color: gray">';
            echo $chat[$i]["type"] . ' / ' . $chat[$i]["action"] . ' / ' . json_encode($chat[$i]["data"]);
            echo '</li>';
        }
    }
    if (count($chat) === 0) {
        echo '<li style="color:gray">[No Chat Messages]</li>';
    }
    echo '</ul>';

    ?>
</body>
</html>