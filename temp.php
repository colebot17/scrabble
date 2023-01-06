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

$newPwd = "qj63ti48QU";

// hash the password
$hash = password_hash($newPwd, PASSWORD_DEFAULT);

// change the password
$sql = "UPDATE accounts SET pwd='$hash' WHERE id='$user'";
$query = mysqli_query($conn, $sql);
echo '{"errorLevel":0,"message":"Password changed."}';

// close the connection
$conn->close();

?>