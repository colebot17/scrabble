<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$newName = $_POST['newName'];

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
require "verifyPassword.php";
verifyPassword($conn, $user, $pwd, false);

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