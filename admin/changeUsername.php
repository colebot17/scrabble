<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
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