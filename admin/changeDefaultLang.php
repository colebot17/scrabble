<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Default Language - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Change Default Language</h1>
    <form method="POST">
        <?php echo '<input type="text" name="username"' . (array_key_exists('user', $_GET) ? ' value="' . $_GET['user'] . '"' : '') . ' placeholder="Username">';?>
        <select name="newDefaultLang">
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
        </select>
        <br>
        <button>Change Default Language</button>
    </form>

    <?php

    if (array_key_exists('username', $_POST) && array_key_exists('newDefaultLang', $_POST) && $_POST['username'] !== "" && $_POST['newDefaultLang'] !== "") {
        $un = $_POST['username'];
        $newDefaultLang = $_POST['newDefaultLang'];
        
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

        $sql = "UPDATE accounts SET defaultLang='$newDefaultLang' WHERE name='$un'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<br><br><span style="color:red">There was an error changing the default language</span>';
        } else {
            echo '<br><br><span>Default Language Changed to ' . $newDefaultLang . '</span>';
        }

        echo '<br><a href="playerLookup.php?playerName=' . $newUsername . '">Info</a>';
    }

    ?>
</body>
</html>