<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$name = $_POST['name'];
$key = $_POST['key'];
$newPwd = $_POST['newPwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password key
$sql = "SELECT pwd FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if ($key !== $row['pwd']) {
	exit('{"errorLevel":1,"message":"Incorrect Key!"}');
}

// validate password
$pwdValid = strlen($newPwd) >= 8; // pwd must be at least eight characters

// require a valid password
if (!$pwdValid) {
	exit('{"errorLevel":1,"message":"Password must consist of at least eight characters."}');
}

// hash the password
$hash = password_hash($newPwd, PASSWORD_DEFAULT);

// change the password
$sql = "UPDATE accounts SET pwd='$hash' WHERE id='$user'";
$query = mysqli_query($conn, $sql);
echo '{"errorLevel":0,"message":"Password changed."}';

// close the connection
$conn->close();

?>