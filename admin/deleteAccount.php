<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Account - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1 style="color:red">Delete Account</h1>
    <form method="POST">
        <?php echo '<input type="text" name="username"' . (array_key_exists('user', $_GET) ? ' value="' . $_GET['user'] . '"' : '') . ' placeholder="Username">';?>
        <br>
        <button style="color:red;font-weight:bold">Delete Account</button>
        <br><br>
        <label>Warning: This action will affect the users of the site and cannot be undone.</label>
    </form>

    <?php

    if (array_key_exists('username', $_POST) && $_POST['username'] !== "") {
        $un = $_POST['username'];

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

        // make sure the account is empty first
        $sql = "SELECT games, friends, requests, sentRequests FROM accounts WHERE name='$un'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);

        $noGames = $row['games'] === '[]';
        $noFriends = $row['friends'] === '[]';
        $noRequests = $row['requests'] === '[]';
        $noSentRequests = $row['sentRequests'] === '[]';

        if (!($noGames && $noFriends && $noRequests && $noSentRequests)) {
            exit('<br><br><span style="color:red">Accounts that are not empty cannot be deleted</span>');
        }

        $sql = "DELETE FROM accounts WHERE name='$un'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<br><br><span style="color:red">There was an error deleting that user\'s account</span>';
        } else {
            echo '<br><br><span>' . $un . '\'s account has been deleted</span>';
        }
    }

    ?>
</body>
</html>