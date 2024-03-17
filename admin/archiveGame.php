<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
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
            if (!$row) exit(', but the users could not be notified.');

            $players = json_decode($row['players'], true);

            for ($i = 0; $i < count($players); $i++) {
                $players[$i]['gameEndUnseen'] = true;
            }

            $playersJson = json_encode($players);

            $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
            $query = mysqli_query($conn, $sql);
            if (!$query) exit(', but the users could not be notified.');

            echo ', and the users will be notified when they log on.';
        }
    }

    ?>
</body>
</html>