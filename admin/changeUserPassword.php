<?php require "verify.php" ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
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
        
        require_once(__DIR__ . "/../php/util/getConn.php");
        $conn = getConn();

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