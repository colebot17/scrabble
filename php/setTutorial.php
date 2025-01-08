<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$tutorialName = $_POST['tutorialName'];
$value = $_POST['tutorialValue'];
if ($value === "true") $value = true;
if ($value === "false") $value = false;

require(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get the current tutorials list
$sql = "SELECT tutorials FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$tutorials = json_decode($row['tutorials'], true);

// set the specified value
$tutorials[$tutorialName] = $value;

// re-upload the tutorials list
$tutorialsJson = json_encode($tutorials);
$sql = "UPDATE accounts SET tutorials='$tutorialsJson' WHERE id='$user'";
$query = mysqli_query($conn, $sql);

// close the connection
$conn->close();