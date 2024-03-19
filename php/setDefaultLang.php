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

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$newDefaultLang = $_POST['newDefaultLang'];

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

$sql = "UPDATE accounts SET defaultLang='$newDefaultLang' WHERE id='$user'";
$query = mysqli_query($conn, $sql);
if (!$query) exit('{"errorLevel": 2, "message": "Not a valid language"}');

echo '{"errorLevel": 0, "message": "Default Language Updated"}';


// close the connection
$conn->close();