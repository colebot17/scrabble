<?php

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

echo "Cleaning up account game lists:<br>";

$sql = "SELECT id, name, games FROM accounts";
$query = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($query)) {
    $id = $row['id'];
    $name = $row['name'];
    $games = json_decode($row['games'], true);

    echo "$name<br>";

    for ($i = 0; $i < count($games); $i++) {
        $games[$i] = (int)$games[$i];
    }

    $gamesJson = json_encode($games);

    $sql2 = "UPDATE accounts SET games='$gamesJson' WHERE id='$id'";
    $query2 = mysqli_query($conn, $sql);
}

echo '<br>';

echo 'Cleaning up game player lists:<br>';

$sql = "SELECT id, players FROM games";
$query = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($query)) {
    $id = $row['id'];
    $pList = json_decode($row['players'], true);

    echo "$id<br>";

    for ($i = 0; $i < count($pList); $i++) {
        $pList[$i]["id"] = (int)$pList[$i]["id"];
    }

    $pListJson = json_encode($pList);

    $sql2 = "UPDATE games SET players='$pListJson' WHERE id='$id'";
    $query2 = mysqli_query($conn, $sql);
}

echo '<br>';

echo 'Done :)';