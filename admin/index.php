<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
    <title>Scrabble Admin Panel</title>
</head>
<body>
    <h1>This is the admin panel for scrabble.colebot.com</h1>
    <form action="playerLookup.php">
        <label>Player Lookup</label>
        <input type="text" name="playerName" placeholder="Name..." required>
        <button>Get Info</button>
        <a href="userList.php">View All Users</a>
    </form>
    <form action="gameLookup.php">
        <label>Game Lookup</label>
        <input type="text" name="gameId" placeholder="Id..." required>
        <button>Get Info</button>
    </form>
    <form action="validate.php" method="POST">
        <label>Credentials</label>
        <input type="hidden" name="invalidate" value="true">
        <button>Invalidate</button>
    </form>
</body>
</html>