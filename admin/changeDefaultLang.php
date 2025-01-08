<?php require "verify.php" ?>

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
    <?php 
    
    require_once(__DIR__ . "/../php/util/getConn.php");
    $conn = getConn();

    if (array_key_exists('username', $_POST) && array_key_exists('newDefaultLang', $_POST) && $_POST['username'] !== "" && $_POST['newDefaultLang'] !== "") {
        $un = $_POST['username'];
        $newDefaultLang = $_POST['newDefaultLang'];

        $sql = "UPDATE accounts SET defaultLang='$newDefaultLang' WHERE name='$un'";
        $query = mysqli_query($conn, $sql);
        if (!$query) {
            echo '<span style="color:red">There was an error changing the default language</span>';
        } else {
            echo '<span>Default Language changed to ' . $newDefaultLang . '</span>';
        }

        echo '<br><a href="playerLookup.php?playerName=' . $un . '">Info</a>';

        exit();
    }
    
    echo '<form method="POST">';
    
        echo '<input type="text" name="username"' . (array_key_exists('user', $_GET) ? ' value="' . $_GET['user'] . '"' : '') . ' placeholder="Username">';

        $currentDefaultLang = 'english';
        if ($_GET['user']) {
            $gottenName = $_GET['user'];
            $sql = "SELECT defaultLang FROM accounts WHERE name='$gottenName'";
            $query = mysqli_query($conn, $sql);
            $row = mysqli_fetch_assoc($query);
            $currentDefaultLang = $row['defaultLang'];
        }

        $langOptions = Array("english", "spanish", "french");

        echo '<select name="newDefaultLang">';
        for ($i = 0; $i < count($langOptions); $i++) {
            echo '<option value="' . $langOptions[$i] . '"' . ($langOptions[$i] === $currentDefaultLang ? ' selected' : '') . '>' . ucfirst($langOptions[$i]) . '</option>';
        }
        echo '</select>';

        echo '<br>';
        echo '<button>Change Default Language</button>';

    echo '</form>';
    
    ?>
</body>
</html>