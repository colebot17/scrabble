<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];

$number = preg_replace('/\D/', '', $_POST['number']);
if (strlen($number) !== 10) {
    exit('{"errorLevel":1,"message":"Please supply the number in 10-digit format without the country code."}');
}

$carrier = $_POST['carrier'];
require "carriers.php";
if (!array_key_exists($carrier, $carrierAddresses)) {
    exit('{"errorLevel":1,"message":"Unsupported Carrier"}');
}

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

// make sure there isn't already an identical method (and make sure it's enabled if there is)
$exists = false;
for ($i = 0; $i < count($methods); $i++) {
    if ($methods[$i]["type"] === "sms" && $methods[$i]["number"] === $number && $methods[$i]["carrier"] === $carrier) {
        $exists = true;
        $methods[$i]["enabled"] = true;
    }
}

if (!$exists) {
    $methods[] = Array(
        "type" => "sms",
        "enabled" => true,
        "number" => $number,
        "carrier" => $carrier
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

// send the confirmation message
require "sendEmail.php";
require "templates/sms.php";

$body = $smsTemplates["confirmation"]($un, $number, $user);
sendEmail($number . '@' . $carrierAddresses[$carrier], "scrabble.colebot.com", $body);

// return the success response
$res = Array(
    "errorLevel" => 0,
    "message" => "SMS number added."
);
echo json_encode($res);