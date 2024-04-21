<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Notifications - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Player Notifications</h1>
    <?php

    $user = (int)$_GET['user'];

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

    $sql = "SELECT name, notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user with id #' . $user . '.</h2>';
        exit();
    }

    $un = $row['name'];
    $methods = json_decode($row['notificationMethods'], true);

    echo '<h2><a href="playerLookup.php?playerName=' . $un . '">' . $un . '</a>\'s Notifications</h2>';

    echo '<ul>';

    for ($i = 0; $i < count($methods); $i++) {
        $type = $methods[$i]['type'];
        if ($type === "email") {
            echo '<li><span style="color:gray">Email:</span> ' . $methods[$i]['address'] . ($methods[$i]["enabled"] ? '' : ' <span style="color:red">[Disabled]</span>') . '</li>';
        } else {
            echo '<li style="color:gray">' . json_encode($methods[$i]) . '</li>';
        }
    }

    echo '</ul>';


    ?>
</body>
</html>