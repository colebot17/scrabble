<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$subscription = json_decode($_POST['subscription'], true);
$userAgent = $_POST['userAgent'];

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

// handle duplicate methods
$exists = false;
for ($i = 0; $i < count($methods); $i++) {
    if ($methods[$i]["type"] === "push" && $methods[$i]["subscription"]["endpoint"] === $subscription["endpoint"]) {
        $exists = true;
        $methods[$i]["enabled"] = true;
        $methods[$i]["userAgent"] = $userAgent;
    }
}

if (!$exists) {
    $methods[] = Array(
        "type" => "push",
        "enabled" => true,
        "subscription" => $subscription,
        "userAgent" => $userAgent
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
require "templates/push.php";
$messageObj = $pushTemplates["confirmation"](null, null, null);

require "sendPush.php";
sendPush($subscription, $messageObj);

// return the success response
$res = Array(
    "errorLevel" => 0,
    "message" => "Push method added."
);
echo json_encode($res);