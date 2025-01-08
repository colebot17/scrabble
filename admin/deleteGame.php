<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Game - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1 style="color:red">Delete Game</h1>
    <form method="POST">
        <?php echo '<input type="text" name="gameId"' . (array_key_exists('game', $_GET) ? ' value="' . $_GET['game'] . '"' : '') . ' placeholder="Game Id">';?>
        <br>
        <button style="color:red;font-weight:bold">Delete Game</button>
        <br><br>
        <label>Warning: This action will affect the users of the site and cannot be undone.</label>
    </form>

    <?php

    if (array_key_exists('gameId', $_POST) && $_POST['gameId'] !== "") {
        $gameId = $_POST['gameId'];

        require_once(__DIR__ . "/../php/util/getConn.php");
        $conn = getConn();

        $sql = "DELETE FROM games WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<br><br><span style="color:red">There was an error deleting the game</span>';
        } else {
            echo '<br><br><span>Game ' . $gameId . ' deleted</span>';
        }
    }

    ?>
</body>
</html>