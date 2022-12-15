<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$key = $_POST['key'];
$newPwd = $_POST['newPwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password key
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if ($key !== $row['pwd']) {
	exit('{"errorLevel":1,"message":"Incorrect Key!","debug":"' . $key . ', ' . $row['pwd'] . '"}');
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