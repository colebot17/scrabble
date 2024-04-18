<?php 

require "sendEmail.php";

// this function sends an email with a specified subject and body to all enabled email addresses of a specified user
function notifyByEmail($conn, $user, $subject, $body) {
    $sql = "SELECT notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        return Array("errorLevel" => 2, "message" => "User not found");
    }

    $methods = json_decode($row['notificationMethods'], true);

    for ($i = 0; $i < count($methods); $i++) {
        if ($methods[$i]["type"] === "email") {
            sendEmail($methods[$i]["address"], $subject, $body);
        }
    }
}


// in the future, this file might also contain a function to notify by push, web, etc.