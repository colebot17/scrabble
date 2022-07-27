<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$userPwd = $_POST['pwd'];
$name = $_POST['name'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die('{"errorLevel":2,"message":"Connection Failed!"}');
}

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($userPwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

$sql = "SELECT id, name FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if ($row) {
	echo '{"errorLevel":0,"message":"The user has been found.","value":{"id":"' . $row["id"] . '","name":"' . $row["name"] . '"}}';
} else {
	exit('{"errorLevel":1,"message":"The specified user could not be found."}');
}

// close the connection
$conn->close();

?>