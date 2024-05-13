<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resubscribe</title>

    <!-- import the font Rubik -->
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300&display=swap" rel="stylesheet">

    <!-- beautiful css -->
    <link rel="stylesheet" type="text/css" href="https://www.colebot.com/style.css">
</head>
<body>
    <?php

    if (!array_key_exists('email', $_GET) || !array_key_exists('user', $_GET)) {
        $title = "Invalid Link";
        $body = "If you would like to receive email notifications for your scrabble account, please visit <a class='underline' href='https://scrabble.colebot.com'>scrabble.colebot.com</a> and manage your notification preferences from settings.";
    } else {
        $email = $_GET['email'];
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

        // get the user's notification methods
        $sql = "SELECT notificationMethods FROM accounts WHERE id='$user'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        $methods = json_decode($row['notificationMethods'], true);

        // go through and enable any methods that have the specified email
        $anyMatching = false;
        for ($i = 0; $i < count($methods); $i++) {
            if ($methods[$i]['type'] === "email" && $methods[$i]['address'] === $email) {
                $anyMatching = true;
                $methods[$i]["enabled"] = false;
            }
        }

        if (!$anyMatching) {
            $title = "Error";
            $body = "The email address <b>$email</b> has never been associated with your account. To add a new email, please visit <a class='underline' href='https://scrabble.colebot.com'>scrabble.colebot.com</a> and manage your notification preferences from settings.";
        } else {
            // re-upload the notification methods
            $methodsJson = json_encode($methods);
            $sql = "UPDATE accounts SET notificationMethods='$methodsJson' WHERE id='$user'";
            $query = mysqli_query($conn, $sql);

            // done!
            $title = "You're back in!";
            $body = "You will now continue to receive scrabble email notifications through the address <b>$email</b>.";
            $body .= "<a href='unsubscribe.php?email=$email&user=$user'>Unsubscribe</a>";
        }
    }

    ?>

    <div class="section" id="section0">
        <div class="gridHeader">
            <div class="headerSide"></div>
            <div class="headerCenter"><h1><?php echo $title; ?></h1></div>
            <div class="headerSide"></div>
        </div>
    </div>
    <div class="section" id="bodySection">
        <p><?php echo $body; ?></p>
    </div>
</body>
</html>