<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remove Notification Method - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Remove Notification Method</h1>
    <?php

    $user = (int)$_GET['user'];
    $index = (int)$_GET['index'];

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

    $sql = "SELECT notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user with id #' . $user . '.</h2>';
        exit();
    }

    $methods = json_decode($row['notificationMethods'], true);

    if (!array_key_exists($index, $methods)) {
        echo '<h2 style="color:red">Invalid Index</h2>';
        exit();
    }

    unset($methods[$index]);

    $methods = array_values($methods);

    $methodsJson = json_encode($methods);
    $sql = "UPDATE accounts SET notificationMethods='$methodsJson' WHERE id='$user'";
    $query = mysqli_query($conn, $sql);

    header('Location: manageNotifications.php?user=' . $user);

    ?>
</body>
</html>