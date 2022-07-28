<?php

// define connection variables
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$game = $_POST['game'];

// check password
$sql = "SELECT pwd, games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

// decode the games list
$gamesList = json_decode($row['games'], true);

// make sure the user owns the game
if (!array_search(strval($game), $gamesList)) {
    exit('{"errorLevel":2,"message":"You can\'t remove a game you don\'t own!"}');
}

// remove the game from the games list
unset($gamesList[array_search($game, $gamesList)]);
$gamesList = array_values($gamesList); // un-associate

// encode and re-upload the changed array
$gamesListJson = json_encode($gamesList);
$sql = "UPDATE accounts SET games='$gamesListJson' WHERE id='$user'";
$query = mysqli_query($conn, $sql);
if (!$query) {
    exit('{"errorLevel":1,"message","Could not remove the game."}');
}

// send response back to client
echo '{"errorLevel":0,"message":"The game has been removed from your list."}';

// close the connection
$conn->close();

?>