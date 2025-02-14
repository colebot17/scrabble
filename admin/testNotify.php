<?php require "verify.php" ?>

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

    require_once(__DIR__ . "/../php/util/getConn.php");
    $conn = getConn();
    
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