<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$index = $_POST['index'];

require(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get the current list
$sql = "SELECT notificationMethods FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$methods = json_decode($row['notificationMethods'], true);

unset($methods[$index]);
$methods = array_values($methods);

// re-upload the list
$methodsJson = json_encode($methods);
$sql = "UPDATE accounts SET notificationMethods='$methodsJson' WHERE id='$user'";
$query = mysqli_query($conn, $sql);

// close the connection
$conn->close();

// return the success response
$res = Array(
    "errorLevel" => 0,
    "message" => "Notification method removed."
);
echo json_encode($res);