<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$newName = $_POST['newName'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

// make sure username isn't taken
$sql = "SELECT id FROM accounts WHERE name='$newName'";
$query = mysqli_query($conn, $sql);
if (mysqli_fetch_assoc($query)) {
	exit('{"errorLevel":1,"message":"This username is already taken."}');
}

// escape the username
$newName = str_replace("'", "\'", $newName);
$newName = str_replace('"', '\"', $newName);

// validate username length
$pwdValid = strlen($newName) >= 2; // pwd must be at least eight characters

// require a valid username
if (!$pwdValid) {
	exit('{"errorLevel":1,"message":"Username must consist of at least two characters."}');
}

// change the username
$sql = "UPDATE accounts SET name='$newName' WHERE id='$user'";
$query = mysqli_query($conn, $sql);
echo '{"errorLevel":0,"message":"Username changed."}';

// close the connection
$conn->close();

?>