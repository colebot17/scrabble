<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
    <title>Delete Game - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1 class="danger">Delete Game</h1>
    <form method="POST">
        <?php echo '<input type="text" name="gameId"' . (array_key_exists('game', $_GET) ? ' value="' . $_GET['game'] . '"' : '') . ' placeholder="Game Id">';?>
        <button style="font-weight:bold" class="danger">Delete Game</button>
    </form>
    <label>Warning: This action will affect the users of the site and cannot be undone.</label>

    <?php

    if (array_key_exists('gameId', $_POST) && $_POST['gameId'] !== "") {
        $gameId = $_POST['gameId'];

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

        $sql = "DELETE FROM games WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<br><br><span class="danger">There was an error deleting the game</span>';
        } else {
            echo '<br><br><span class="success">Game ' . $gameId . ' deleted</span>';
        }
    }

    ?>
</body>
</html>