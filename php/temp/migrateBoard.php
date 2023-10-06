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

$sql = "SELECT board, id FROM games";
$query = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($query)) {

    $board = json_decode($row['board'], true);

    for ($y = 0; $y < count($board); $y++) {
        for ($x = 0; $x < count($board); $x++) {
            if ($board[$y][$x]) {
                $board[$y][$x]["x"] = $x;
                $board[$y][$x]["y"] = $y;
            }
        }
    }

    $boardJson = json_encode($board);

    $sql2 = "UPDATE games SET board='$boardJson' WHERE id='$game'";
    $query2 = mysqli_query($conn, $sql2);

    echo "Updated " . $row['id'] . "!<br>";

}

?>