<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change User Password - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1 style="color:red">Change User Password</h1>
    <form method="POST">
        <?php echo '<input type="text" name="username"' . (array_key_exists('user', $_GET) ? ' value="' . $_GET['user'] . '"' : '') . ' placeholder="Username" oninput="document.getElementById(`dynamicUsername`).textContent = this.value || `User`">';?>
        <br>
        <input type="text" name="newPassword" placeholder="New Password">
        <br>
        <button style="color:red;font-weight:bold">Change <span id="dynamicUsername"><?php echo (array_key_exists('user', $_GET) ? $_GET['user'] : 'User')?></span>'s Password</button>
        <br><br>
        <label>Warning: This action will affect the users of the site and cannot be undone.</label>
    </form>

    <?php

    if (array_key_exists('username', $_POST) && array_key_exists('newPassword', $_POST) && $_POST['username'] !== "" && $_POST['newPassword'] !== "") {
        $un = $_POST['username'];
        $newPassword = $_POST['newPassword'];
        
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

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $sql = "UPDATE accounts SET pwd='$hash' WHERE name='$un'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<br><br><span style="color:red">There was an error changing the password</span>';
        } else {
            echo '<br><br><span>Password Changed to &apos;' . $newPassword . '&apos;</span>';
        }
    }

    ?>
</body>
</html>