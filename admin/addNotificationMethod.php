<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Notification Email - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Add Notification Email</h1>
    <?php

    $user = (int)$_GET['user'];

    // define connection
    $servername = "173.201.180.187";
    $username = "Colebot";
    $password = "96819822";
    $dbname = "scrabble";

    // create and check connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT un, notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user with id #' . $user . '.</h2>';
        exit();
    }
    $methods = json_decode($row['notificationMethods'], true);
    $un = $row['name'];

    $type = $_POST["type"];
    if ($type !== "email") {
        echo '<h2 style="color:red">Unrecognized Method Type \'' . $type . '\'</h2>';
        exit();
    }
    $address = $_POST["address"];
    $confirm = $_POST["confirm"];
    if ($confirm === "true") {
        $confirm = true;
    } else if ($confirm === "false") {
        $confirm = false;
    } else {
        $confirm = !!$confirm;
    }

    $newMethod = Array(
        "type" => $type,
        "address" => $address,
        "enabled" => true
    );
    $methods[] = $newMethod;

    $methodsJson = json_encode($methods);
    $sql = "UPDATE accounts SET notificationMethods='$methodsJson' WHERE id='$user'";
    $query = mysqli_query($conn, $sql);


    require "../php/notifications/sendEmail.php";
    require "../php/notifications/templates/confirmationEmail.php";

    if ($confirm) {
        $confirmationBody = confirmationEmail($un, $address, $user);
        sendEmail($address, "Email address added", $confirmationBody);
    }

    header('Location: manageNotifications.php?user=' . $user);

    ?>
</body>
</html>