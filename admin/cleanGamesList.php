<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clean Games List - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Clean Games List</h1>
    <?php

    $playerId = $_GET['playerId'];

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

    $sql = "SELECT name, games FROM accounts WHERE id='$playerId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user with the id ' . $playerId . '</h2>';
        exit();
    }

    $name = $row['name'];
    $games = json_decode($row['games'], true);

    $len = count($games);
    for ($i = 0; $i < $len; $i++) {
        $sql = "SELECT id FROM games WHERE id='$games[$i]'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) unset($games[$i]);
    }

    $games = array_values($games);

    $gamesJson = json_encode($games);

    $sql = "UPDATE accounts SET games='$gamesJson' WHERE id='$playerId'";
    $query = mysqli_query($conn, $sql);
    
    header("Location: playerLookup.php?playerName=$name");

    ?>
</body>
</html>