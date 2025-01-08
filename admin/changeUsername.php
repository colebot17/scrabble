<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Username - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Change Username</h1>
    <form method="POST">
        <?php echo '<input type="text" name="username"' . (array_key_exists('user', $_GET) ? ' value="' . $_GET['user'] . '"' : '') . ' placeholder="Username">';?>
        <br>
        <input type="text" name="newUsername" placeholder="New Username">
        <br>
        <button>Change Username</button>
    </form>

    <?php

    if (array_key_exists('username', $_POST) && array_key_exists('newUsername', $_POST) && $_POST['username'] !== "" && $_POST['newUsername'] !== "") {
        $un = $_POST['username'];
        $newUsername = $_POST['newUsername'];
        
        require(__DIR__ . "/../php/util/getConn.php");
        $conn = getConn();

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