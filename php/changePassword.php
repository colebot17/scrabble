<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$newPwd = $_POST['newPwd'];

require(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check current password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
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