<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$name = $_POST['name'];

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
require "verifyPassword.php";
verifyPassword($conn, $user, $pwd);

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