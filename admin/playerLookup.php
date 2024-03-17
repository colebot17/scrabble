<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Lookup - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.html">Admin Home</a></h3>
    <h1>Player Lookup</h1>
    <?php

    $playerName = $_GET['playerName'];

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

    $sql = "SELECT name, id, games, creationDate FROM accounts WHERE name='$playerName'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);

    if (!$row) {
        echo '<h2 style="color:red">Error: The specified user could not be found</h2>';
        exit();
    }

    $currentPlayerId = $row['id'];
    $currentPlayerName = $row['name'];

    echo '<h2>' . $row['name'] . ' <span style="color:gray">#' . $row['id'] . '</span></h2>';

    echo '<p>Account Creation Date: ' . ($row['creationDate'] !== "0000-00-00" ? $row['creationDate'] : '<span style="color:gray">[Unknown]</span>') . '</p>';

    $games = json_decode($row['games'], true);

    echo '<h4>Games</h4><ul>';
    for ($i = 0; $i < count($games); $i++) {
        $sql = "SELECT name, inactive, players FROM games WHERE id='$games[$i]'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) continue;

        echo '<li>';

        if ($row['inactive']) {
            echo '<span style="color:red;">[inactive]</span> ';
        }

        echo $row['name'] . ' <span style="color: gray">#' . $games[$i] . '</span>';

        echo ' <a href="gameLookup.php?gameId=' . $games[$i] . '">Details</a>';


        $players = json_decode($row['players'], true);
        echo '<ul>';

        $nameCache = Array($currentPlayerId => $currentPlayerName);

        for ($j = 0; $j < count($players); $j++) {
            $id = $players[$j]["id"];

            $name = "";
            if (array_key_exists($id, $nameCache)) {
                $name = $nameCache[$id];
            } else {
                $sql = "SELECT name FROM accounts WHERE id=$id";
                $query = mysqli_query($conn, $sql);
                $row = mysqli_fetch_assoc($query);
                if (!$row) continue;

                $name = $row['name'];
                $nameCache[$id] = $name;
            }

            echo '<li>';
            if (array_key_exists('endGameRequest', $players[$j]) && $players[$j]['endGameRequest']) echo '<span style="color:red">[EndGameRequest]</span> ';
            if ($id == $currentPlayerId) echo '<span style="color: gray">';
            echo $name;
            echo ' <span style="color:gray">#' . $players[$j]["id"] . '</span>';
            if ($id == $currentPlayerId) echo '</span>';
            echo '</li>';
        }

        echo '</ul>';

        echo '</li>';
    }
    if (count($games) === 0) echo '<span style="color:gray">[No Games]</span>';
    echo '</ul>';

    ?>
</body>
</html>