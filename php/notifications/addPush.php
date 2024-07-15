<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$subscription = json_decode($_POST['subscription'], true);

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

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

// // handle duplicate methods and method information
// $exists = false;
// for ($i = 0; $i < count($methods); $i++) {

//     if ($methods[$i]["type"] === "sms" && $methods[$i]["number"] === $number) {
//         $exists = true;
//         $methods[$i]["enabled"] = true;
//         $methods[$i]["carrier"] = $carrier;
//     }
// }

// maybe we could compare the subscription endpoint urls?

// if (!$exists) {
    $methods[] = Array(
        "type" => "push",
        "enabled" => true,
        "subscription" => $subscription
    );
// }

// re-upload the list
$methodsJson = json_encode($methods);
$sql = "UPDATE accounts SET notificationMethods='$methodsJson' WHERE id='$user'";
$query = mysqli_query($conn, $sql);

// get the user's name
$sql = "SELECT name FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$un = $row['name'];

// close the connection
$conn->close();

// send the confirmation message
require "sendPush.php";
// require "templates/sms.php";

sendPush($subscription);

// return the success response
$res = Array(
    "errorLevel" => 0,
    "message" => "Push method added."
);
echo json_encode($res);