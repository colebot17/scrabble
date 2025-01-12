<?php

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$newDefaultLang = $_POST['newDefaultLang'];

// check password
require "verifyPassword.php";
verifyPassword($conn, $user, $pwd, false);

$sql = "UPDATE accounts SET defaultLang='$newDefaultLang' WHERE id='$user'";
$query = mysqli_query($conn, $sql);
if (!$query) exit('{"errorLevel": 2, "message": "Not a valid language"}');

echo '{"errorLevel": 0, "message": "Default Language Updated"}';


// close the connection
$conn->close();