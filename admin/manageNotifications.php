<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Notification Methods - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Player Notification Methods</h1>
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

    $sql = "SELECT name, notificationMethods FROM accounts WHERE id='$user'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) {
        echo '<h2 style="color:red">Error: There is no user with id #' . $user . '.</h2>';
        exit();
    }

    $un = $row['name'];
    $methods = json_decode($row['notificationMethods'], true);

    echo '<h2><a href="playerLookup.php?playerName=' . $un . '">' . $un . '</a>\'s Notification Methods</h2>';

    echo '<ul>';

    for ($i = 0; $i < count($methods); $i++) {
        $type = $methods[$i]['type'];
        echo '<li>';
        if ($type === "email") {
            echo '<span style="color:gray">Email:</span> ' . $methods[$i]['address'];
            if (!$methods[$i]["enabled"]) {
                echo ' <span style="color:red">[Disabled]</span>';
                echo ' - <a href="toggleNotificationMethodEnablement.php?user=' . $user . '&index=' . $i . '">Enable</a>';
                echo ' - <a href="removeNotificationMethod.php?user=' . $user . '&index=' . $i . '" style="color:red">Remove</a>';
            } else {
                echo ' - <a href="toggleNotificationMethodEnablement.php?user=' . $user . '&index=' . $i . '">Disable</a>';
            }
        } else if ($type === "sms") {
            echo '<span style="color:gray">SMS:</span> +1' . $methods[$i]['number'] . ' - ' . $methods[$i]['carrier'];
        } else if ($type === "push") {
            echo '<span style="color:gray">Push:</span> ' . $methods[$i]['userAgent'];
            echo '<ul>';
            echo '<li><span style="color:gray">Endpoint:</span> ' . $methods[$i]["subscription"]["endpoint"] . '</li>';
            echo '<li><span style="color:gray">Expiration Time: ' . $methods[$i]["subscription"]["expirationTime"] . '</span></li>';
            echo '<li><span style="color:gray">Keys: ' . json_encode($methods[$i]["subscription"]["keys"]) . '</span></li>';
            echo '</ul>';
        } else {
            echo '<span style="color:gray">' . json_encode($methods[$i]) . '</span>';
        }
        if (!$methods[$i]["enabled"]) {
            echo ' <span style="color:red">[Disabled]</span>';
            echo ' - <a href="toggleNotificationMethodEnablement.php?user=' . $user . '&index=' . $i . '">Enable</a>';
            echo ' - <a href="removeNotificationMethod.php?user=' . $user . '&index=' . $i . '" style="color:red">Remove</a>';
        } else {
            echo ' - <a href="toggleNotificationMethodEnablement.php?user=' . $user . '&index=' . $i . '">Disable</a>';
        }
        echo '</li>';
    }

    if (count($methods) === 0) {
        echo '<li style="color:gray">[No Notification Methods]</li>';
    }

    echo '</ul>';

    ?>

    <h4>Add Email Notification Method</h4>
    <?php echo '<form method="POST" action="addNotificationMethod.php?user=' . $user .'">'; ?>
        <input type="email" name="address" placeholder="Email...">
        <input type="hidden" name="type" value="email">
        <select name="confirm">
            <option value="true">Send Confirmation</option>
            <option value="false">Don't Send Confirmation</option>
        </select>
        <button>Add</button>
    </form>

    <h4>Add SMS Notification Method</h4>
    <?php echo '<form method="POST" action="addSMSNotificationMethod.php?user=' . $user .'">'; ?>
        <input type="tel" name="number" placeholder="Phone Number...">
        <select name="carrier">
            <option disabled selected value="">--Select Carrier--</option>
            <option value="at&t">AT&T</option>
            <option value="sprint">Sprint</option>
            <option value="t-mobile">T-Mobile</option>
            <option value="verizon">Verizon</option>
        </select>
        <select name="confirm">
            <option value="true">Send Confirmation</option>
            <option value="false">Don't Send Confirmation</option>
        </select>
        <button>Add</button>
    </form>
</body>
</html>