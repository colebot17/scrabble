<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Notification Method - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Add Notification Method</h1>
    <?php

    $user = (int)$_GET['user'];

    require_once(__DIR__ . "/../php/util/getConn.php");
    $conn = getConn();

    $sql = "SELECT name, notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user with id #' . $user . '.</h2>';
        exit();
    }
    $methods = json_decode($row['notificationMethods'], true);
    $un = $row['name'];
    
    $number = preg_replace('/\D/', '', $_POST["number"]);
    if (strlen($number) !== 10) {
        echo '<h2 style="color:red">Error: Invalid number format</h2>';
        echo '<p>Please format phone numbers in a 10-digit format, excluding the country code.</p>';
        exit();
    }

    $carrier = $_POST["carrier"];

    $confirm = $_POST["confirm"];
    if ($confirm === "true") {
        $confirm = true;
    } else if ($confirm === "false") {
        $confirm = false;
    } else {
        $confirm = !!$confirm;
    }

    $newMethod = Array(
        "type" => 'sms',
        "number" => $number,
        "carrier" => $carrier,
        "enabled" => true
    );
    $methods[] = $newMethod;

    $methodsJson = json_encode($methods);
    $sql = "UPDATE accounts SET notificationMethods='$methodsJson' WHERE id='$user'";
    $query = mysqli_query($conn, $sql);

    if ($confirm) {
        require "../php/notifications/sendEmail.php";
        require "../php/notifications/templates/sms.php";
        require "../php/notifications/carriers.php";

        $confirmationBody = $smsTemplates["confirmation"]($un, $number, $user);
        sendEmail($number . '@' . $carrierAddresses[$carrier], "scrabble.colebot.com", $confirmationBody);
    }

    header('Location: manageNotifications.php?user=' . $user);

    ?>
</body>
</html>