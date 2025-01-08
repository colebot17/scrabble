<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validate Credentials - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com</h3>
    <h1>Validate Credentials</h1>

    <form method="POST">
        <input name="password" type="password" placeholder="Password">
        <button>Validate</button>
    </form>

    <?php

    if (array_key_exists('invalidate', $_POST)) {
        setcookie('password', '', time() - 3600);
        echo 'Session Invalidated';
    } else if (array_key_exists('password', $_POST)) {
        require_once(__DIR__ . '/../vendor/autoload.php');
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/../");
        $dotenv->load();

        if ($_POST['password'] === $_ENV["ADMIN_PASSWORD"]) {
            setcookie('password', $_ENV["ADMIN_PASSWORD"]);
            echo 'Redirecting...';
            header('Location: index.php');
        } else {
            echo '<span style="color:red">Incorrect Password</span>';
        }
    }
    
    ?>
</body>
</html>