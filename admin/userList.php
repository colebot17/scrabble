<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User List - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>User List</h1>
    <?php

    require_once(__DIR__ . "/../php/util/getConn.php");
    $conn = getConn();

    $sql = "SELECT id, name, games, friends, requests, sentRequests FROM accounts ORDER BY id ASC";
    $query = mysqli_query($conn, $sql);

    echo '<ul>';

    require "templates.php";

    while ($row = mysqli_fetch_assoc($query)) {
        $nameCache = Array($row['id'] => $row['name']);

        $noGames = $row['games'] === '[]';
        $noFriends = $row['friends'] === '[]';
        $noRequests = $row['requests'] === '[]';
        $noSentRequests = $row['sentRequests'] === '[]';

        echo '<li>';
        echo playerLine($row['id'], $nameCache, $conn);
        if ($noGames && $noFriends && $noRequests && $noSentRequests) echo ' <span style="color:red">[Empty]</span>';
        echo '</li>';
    }

    echo '</ul>';

    echo '<br><a href="https://scrabble.colebot.com/tempAccLog.txt">Temporary Account Login Log</a>';

    ?>
</body>
</html>