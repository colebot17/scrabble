<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// get data from client
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$game = $_POST['game'];
$name = $_POST['name'];

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

// make sure the game belongs to the user
$sql = "SELECT games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$userGames = json_decode($row['games'], true);
if (!in_array($game, $userGames)) {
	exit('{"errorLevel":2,"message":"You do not own this game!"}');
}

// escape user input for JSON
$name = str_replace('"', '\"', $name);
$name = trim($name);

// escape user input for SQL
$uploadName = str_replace("'", "\'", $name);
$uploadName = str_replace('`', '\`', $uploadName);
$uploadName = str_replace('_', '\_', $uploadName);
$uploadName = str_replace('%', '\%', $uploadName);

// set the name
$sql = "UPDATE games SET name='$uploadName' WHERE id='$game'";
$query = mysqli_query($conn, $sql);

if (!$query) {
    exit('{"errorLevel":1,"message":"Could not rename game"}');
}

echo '{"errorLevel":0,"message":"Game renamed to \"' . $name . '\".","data":"' . $name . '"}';

mysqli_close($conn);

?>