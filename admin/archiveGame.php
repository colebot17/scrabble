<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archive Game - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Archive Game</h1>
    <form method="POST">
        <?php echo '<input type="text" name="gameId"' . (array_key_exists('game', $_GET) ? ' value="' . $_GET['game'] . '"' : '') . ' placeholder="Game Id">';?>
        <select name="mode">
            <option value="loud">Notify players</option>
            <option value="quiet">Do not notify players</option>
        </select>
        <br>
        <button>Archive Game</button>
    </form>

    <?php

    if (array_key_exists('gameId', $_POST) && $_POST['gameId'] !== "" && array_key_exists('mode', $_POST) && $_POST['mode']) {
        $gameId = $_POST['gameId'];
        $mode = $_POST['mode'];
        // mode can be loud or quiet

        require(__DIR__ . "/../php/util/getConn.php");
        $conn = getConn();

        $sql = "UPDATE games SET inactive=1 WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            exit('<br><br><span style="color:red">There was an error performing the specified action: ' . $mode . '</span>');
        } else {
            echo '<br><br><span>Game ' . $gameId . ' has been archived</span>';
        }

        if ($mode === 'loud') {
            $sql = "SELECT players FROM games WHERE id='$gameId'";
            $query = mysqli_query($conn, $sql);
            $row = mysqli_fetch_assoc($query);
            if (!$row) exit(', but its players could not be notified.');

            $players = json_decode($row['players'], true);

            for ($i = 0; $i < count($players); $i++) {
                $players[$i]['gameEndUnseen'] = true;
            }

            $playersJson = json_encode($players);

            $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
            $query = mysqli_query($conn, $sql);
            if (!$query) exit(', but its players could not be notified.');

            echo ', and its players will be notified when they log on.';
        }

        echo '<br><a href="gameLookup.php?gameId=' . $gameId . '">Details</a>';
    }

    ?>
</body>
</html>