<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rename Game - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Rename Game</h1>

    <?php

    if (!array_key_exists('gameId', $_GET)) {
        echo '<form method="GET">';
            echo '<input type="number" name="gameId" placeholder="Game ID">';
            echo '<br>';
            echo '<button>Continue</button>';
        echo '</form>';
        exit();
    }

    $gameId = (int)$_GET['gameId'];
    if (!$gameId) {
        echo '<h2 style="color:red">Error: Invalid Game Id</h2>';
        echo '<a href="#">Try Again</a>';
        exit();
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

    $sql = "SELECT name FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no game with an id of ' . $gameId . '</h2>';
        exit();
    }

    if (array_key_exists('newName', $_POST)) {
        $newName = $_POST['newName'];
        
        $sql = "UPDATE games SET name='$newName' WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);

        header('Location: gameLookup.php?gameId=' . $gameId);
    }

    $currentName = $row['name'];

    if ($currentName) {
        echo '<h2 style="font-weight:normal">Editing name for game <b>' . $currentName . ' <span style="color:gray">#' . $gameId . '</span></b></h2>';
    } else {
        echo '<h2 style="font-weight:normal">Editing name for game <b><span style="color:gray">#' . $gameId . '</span></b></h2>';
    }

    echo '<form method="POST">';
        echo '<input name="newName" type="text" placeholder="New Name" value="' . $currentName . '">';
        echo '<button>Change Name</button>';
    echo '</form>';

    ?>
</body>
</html>