<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Notification Methods - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Player Notification Methods</h1>
    
    <?php

    if (!array_key_exists('user', $_GET)) {
        exit('<h2 style="color:red">No Player Supplied</h2>');
    }
    $user = $_GET['user'];

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
    
    $sql = "SELECT name FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $name = $row['name'];

    require_once "../php/notifications/notify.php";

    notify($conn, $user, "test", Array());

    echo '<h2><a href="playerLookup.php?playerName=' . $name . '">' . $name . '</a> has been notified.</h2>';

    ?>
</body>
</html>