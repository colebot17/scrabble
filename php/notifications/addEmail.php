<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$address = $_POST['address'];

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

// make sure there isn't already a method with this email (and make sure it's enabled if there is)
$exists = false;
for ($i = 0; $i < count($methods); $i++) {
    if ($methods[$i]["type"] === "email" && $methods[$i]["address"] === $address) {
        $exists = true;
        $methods[$i]["enabled"] = true;
    }
}

if (!$exists) {
    $methods[] = Array(
        "type" => "email",
        "enabled" => true,
        "address" => $address
    );
}

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

// send the confirmation email
require "sendEmail.php";
require "templates/confirmationEmail.php";

$body = confirmationEmail($un, $address, $user);
sendEmail($address, "Email address added", $body);

// return the success response
$res = Array(
    "errorLevel" => 0,
    "message" => "Email added."
);
echo json_encode($res);