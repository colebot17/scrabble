<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Lookup - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Game Lookup</h1>
    <?php

    $gameId = $_GET['gameId'];

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

    $sql = "SELECT name, players, turn, inactive, creationDate, endDate FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);

    if (!$row) {
        echo '<h2 style="color:red">Error: There is no game with an id of ' . $gameId . '</h2>';
        exit();
    }

    echo '<h2>' . $row['name'] . ' <span style="color:gray">#' . $gameId . '</span></h2>';

    echo '<p>';

    if ($row['inactive']) {
        echo '<span style="color:red">Inactive</span><br>';
    } else {
        echo 'Active<br>';
    }

    $turn = $row['turn'];
    echo 'Turn: ' . $turn . '<br>';

    echo 'Start Date: ' . ($row['creationDate'] !== '0000-00-00' ? $row['creationDate'] : '<span style="color:gray">[Unknown]</span>') . '<br>';
    if ($row['inactive']) echo 'End Date: ' . ($row['endDate'] !== '0000-00-00' ? $row['endDate'] : '<span style="color:gray">[Unknown]</span>') . '<br>';

    echo '<a style="color:red" href="deleteGame.php?game=' . $gameId . '">Delete Game</a>';

    echo '</p>';

    echo '<h4>Players</h4>';

    $players = json_decode($row['players'], true);

    echo '<ul>';
    for ($i = 0; $i < count($players); $i++) {
        $id = $players[$i]['id'];

        $sql = "SELECT name FROM accounts WHERE id='$id'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) continue;

        $name = $row['name'];

        echo '<li>';
        if (array_key_exists('endGameRequest', $players[$i]) && $players[$i]['endGameRequest']) echo '<span style="color:red">[EndGameRequest]</span> ';
        echo $name . ' <span style="color:gray">#' . $id . '</span>';
        echo ' <a href="playerLookup.php?playerName=' . $name . '">Info</a>';

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
    echo '</ul>';

    ?>
</body>
</html>