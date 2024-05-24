<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
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
        if ($_POST['password'] === '96819822') {
            setcookie('password', '96819822');
            echo 'Redirecting...';
            header('Location: index.php');
        } else {
            echo '<span style="color:red">Incorrect Password</span>';
        }
    }
    
    ?>
</body>
</html>