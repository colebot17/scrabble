<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
    <title>Edit Letter Bag - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Edit Letter Bag</h1>

    <?php

    if (!array_key_exists('gameId', $_GET)) exit('<h2 style="color:red">A game id is required to edit the letter bag</h2>');
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

    if (array_key_exists('submit', $_POST)) {
        $sql = "SELECT letterBag FROM games WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) exit("An unforseen error occurred");

        $letterBag = json_decode($row['letterBag'], true);

        for ($i = 0; $i < count($_POST); $i++) {
            $key = array_keys($_POST)[$i];
            $value = array_values($_POST)[$i];

            if ($key === 'submit') continue;

            $letterBag[$key] = (int)$value;
        }

        $letterBagJson = json_encode($letterBag);

        $sql = "UPDATE games SET letterBag='$letterBagJson' WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        if ($query) {
            echo 'Letter Bag Updated<br><a href="gameLookup.php?gameId=' . $gameId . '">Details</a>';
        } else {
            echo 'Error updating letter bag';
        }

        exit();
    }

    $sql = "SELECT letterBag FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) exit('<h2 style="color:red">There is no game with the id ' . $gameId . '</h2>');

    $letterBag = json_decode($row['letterBag'], true);

    echo '<form method="POST">';

    for ($i = 0; $i < count($letterBag); $i++) {
        $letter = array_keys($letterBag)[$i] !== "" ? array_keys($letterBag)[$i] : "_";
        $count = array_values($letterBag)[$i];

        echo '<label for="input' . $letter . '">' . $letter . ': </label><input id="input' . $letter . '" type="number" name="' . $letter . '" value="' . $count . '"><br>';
    }

    echo '<button name="submit">Update Letter Bag</button>';
    
    echo '</form>';
    
    ?>

    <?php

    if (array_key_exists('username', $_POST) && array_key_exists('newUsername', $_POST) && $_POST['username'] !== "" && $_POST['newUsername'] !== "") {
        $sql = "UPDATE accounts SET name='$newUsername' WHERE name='$un'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<br><br><span style="color:red">There was an error changing the username</span>';
        } else {
            echo '<br><br><span>Username Changed to &apos;' . $newUsername . '&apos;</span>';
        }

        echo '<br><a href="playerLookup.php?playerName=' . $newUsername . '">Info</a>';
    }

    ?>
</body>
</html>