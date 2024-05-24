<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
    <title>Restore Game - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Restore Game</h1>
    <form method="POST">
        <?php echo '<input type="text" name="gameId"' . (array_key_exists('game', $_GET) ? ' value="' . $_GET['game'] . '"' : '') . ' placeholder="Game Id">';?>
        <button>Restore Game</button>
    </form>

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