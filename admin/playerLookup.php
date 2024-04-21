<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Lookup - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Player Lookup</h1>
    <?php

    $playerName = $_GET['playerName'];

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

    $sql = "SELECT name, id, defaultLang, games, creationDate, friends, requests, sentRequests, notificationMethods FROM accounts WHERE name='$playerName'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user named \'' . $playerName . '\'</h2>';
        exit();
    }

    $currentPlayerId = $row['id'];
    $currentPlayerName = $row['name'];
    
    $noGames = $row['games'] === '[]';
    $noFriends = $row['friends'] === '[]';
    $noRequests = $row['requests'] === '[]';
    $noSentRequests = $row['sentRequests'] === '[]';
    $empty = $noGames && $noFriends && $noRequests && $noSentRequests;

    $games = json_decode($row['games'], true);

    $notificationMethods = json_decode($row['notificationMethods'], true);

    echo '<h2>' . $row['name'] . ' <span style="color:gray">#' . $row['id'] . '</span></h2>';


    echo '<p>';

    echo 'Default Language: ' . ucfirst($row['defaultLang']) . ' - <a href="changeDefaultLang.php?user=' . $row['name'] . '">Change</a><br>';
    echo 'Account Creation Date: ' . ($row['creationDate'] !== "0000-00-00" ? $row['creationDate'] : '<span style="color:gray">[Unknown]</span>');
    echo '<br>';
    echo '<a href="changeUsername.php?user=' . $currentPlayerName . '">Change Username</a>';
    echo '<br>';
    echo '<a style="color:red" href="changeUserPassword.php?user=' . $currentPlayerName . '">Change Password</a>';
    echo '<br><br>';
    echo '<span>' . count($notificationMethods) . ' Notification Method' . (count($notificationMethods) === 1 ? '' : 's') . ' - <a href="manageNotifications.php?user=' . $currentPlayerId . '">Manage</a></span>';

    echo '</p>';

    $nameCache = Array($currentPlayerId => $currentPlayerName);

    $friends = json_decode($row['friends'], true);
    $requests = json_decode($row['requests'], true);
    $sentRequests = json_decode($row['sentRequests'], true);

    require "templates.php";

    echo '<h4>Friends</h4><ul><li>' . (count($friends) === 0 ? '<span style="color:gray">[No Current Friends]</span>' : 'Current Friends:') . '<ul>';
    for ($i = 0; $i < count($friends); $i++) {
        echo '<li>' . playerLine($friends[$i], $nameCache, $conn) . '</li>';
    }

    echo '</ul></li><li>' . (count($requests) === 0 ? '<span style="color:gray">[No Incoming Friend Requests]</span>' : 'Incoming Requests:') . '<ul>';
    for ($i = 0; $i < count($requests); $i++) {
        echo '<li>' . playerLine($requests[$i], $nameCache, $conn) . '</li>';
    }
    
    echo '</ul></li><li>' . (count($sentRequests) === 0 ? '<span style="color:gray">[No Outgoing Friend Requests]</span>' : 'Outgoing Requests:') . '<ul>';
    for ($i = 0; $i < count($sentRequests); $i++) {
        echo '<li>' . playerLine($sentRequests[$i], $nameCache, $conn) . '</li>';
    }

    echo '</ul></li></ul>';

    $gamesListNeedsCleaning = false;

    echo '<h4>Games</h4><ul>';
    for ($i = 0; $i < count($games); $i++) {
        $sql = "SELECT name, inactive, players FROM games WHERE id='$games[$i]'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) {
            echo '<li>#' . $games[$i] . ' <span style="color:red">[Not Found]</span></li>';
            $gamesListNeedsCleaning = true;
            continue;
        }

        echo '<li>';

        if ($row['inactive']) {
            echo '<span style="color:red;">[inactive]</span> ';
        }

        echo $row['name'] . ' <span style="color: gray">#' . $games[$i] . '</span>';

        echo ' <a href="gameLookup.php?gameId=' . $games[$i] . '">Details</a>';


        $players = json_decode($row['players'], true);
        echo '<ul>';

        for ($j = 0; $j < count($players); $j++) {
            $id = $players[$j]["id"];

            echo '<li>';
            if (array_key_exists('endGameRequest', $players[$j]) && $players[$j]['endGameRequest']) echo '<span style="color:red">[EndGameRequest]</span> ';
            if ($id == $currentPlayerId) echo '<span style="color: gray">';
            echo playerLine($id, $nameCache, $conn);
            if ($id == $currentPlayerId) echo '</span>';
            echo '</li>';
        }

        echo '</ul>';

        echo '</li>';
    }
    if (count($games) === 0) echo '<span style="color:gray">[No Games]</span>';
    echo '</ul>';
    
    if ($gamesListNeedsCleaning) {
        echo '<a href="cleanGamesList.php?playerId=' . $currentPlayerId . '">Clean Games List</a>';
    }
    if ($empty) {
        echo '<a href="deleteAccount.php?user=' . $currentPlayerName . '" style="color:red">Delete Account</a>';
    }

    ?>
</body>
</html>