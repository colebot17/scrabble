<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scrabble Admin Panel</title>
</head>
<body>
    <h1>This is the admin panel for scrabble.colebot.com</h1>
    <h3>Player Lookup</h3>
    <form action="playerLookup.php">
        <input type="text" name="playerName" placeholder="Name..." required>
        <button>Get Info</button>
    </form>
    <h3>Game Lookup</h3>
    <form action="gameLookup.php">
        <input type="text" name="gameId" placeholder="Id..." required>
        <button>Get Info</button>
    </form>
    <h3>Invalidate Credentials</h3>
    <form action="validate.php" method="POST">
        <input type="hidden" name="invalidate" value="true">
        <button>Invalidate</button>
    </form>
</body>
</html>