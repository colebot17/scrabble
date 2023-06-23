<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];
$updateNumberClient = $_POST['updateNumber'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die('{"errorLevel":2,"message":"Server Error: ' . $conn->connect_error . '}');
}

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get the last update for comparison
$sql = "SELECT updates FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

if (mysqli_num_rows($query) === 0) {
    $ret = Array(
        "errorLevel" => 0,
        "message" => "This game has been permanently deleted.",
        "data" => Array(
            Array(
                "type" => "gameEnd",
                "data" => Array(
                    "gameDeleted" => true,
                    "winnerIndicies" => Array()
                )
            )
        )
    );
    exit(json_encode($ret));
}

$updates = json_decode($row['updates'], true);
$updateNumberServer = count($updates);

if ($updateNumberServer > $updateNumberClient) {
    $newUpdates = array_values(array_slice($updates, $updateNumberClient));

    $ret = Array(
        "errorLevel" => 0,
        "message" => "There are new changes from the server.",
        "data" => $newUpdates
    );
    echo json_encode($ret);
} else {
    echo '{"errorLevel":0,"data":[],"message":"You\'re all caught up!"}';
}

// close the connection
$conn->close();

?>