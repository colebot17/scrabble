<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restore Game - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Restore Game</h1>
    <form method="POST">
        <?php echo '<input type="text" name="gameId"' . (array_key_exists('game', $_GET) ? ' value="' . $_GET['game'] . '"' : '') . ' placeholder="Game Id">';?>
        <br>
        <button>Restore Game</button>
    </form>

    <?php

    if (array_key_exists('gameId', $_POST) && $_POST['gameId'] !== "") {
        $gameId = $_POST['gameId'];

        require_once(__DIR__ . "/../php/util/getConn.php");
        $conn = getConn();

        $sql = "UPDATE games SET inactive=0 WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            exit('<br><br><span style="color:red">There was an error restoring the game</span>');
        } else {
            echo '<br><br><span>Game ' . $gameId . ' has been restored<br><a href="gameLookup.php?gameId=' . $gameId . '">Details</a></span>';
        }

        $sql = "SELECT players FROM games WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) exit();

        $players = json_decode($row['players'], true);

        for ($i = 0; $i < count($players); $i++) {
            $players[$i]['endGameRequest'] = false;
            $players[$i]['endGameUnseen'] = false;
        }

        $playersJson = json_encode($players);
        $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
    }

    ?>
</body>
</html>