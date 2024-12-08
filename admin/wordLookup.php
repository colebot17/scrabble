<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Word Lookup - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Word Lookup</h1>
    <?php

    $word = $_GET['word'];
    // if (!$word) header('Location: index.php');
    if (!$word) echo "no word found";

    $language = $_GET['language'] || "english";

    $dictFile = file_get_contents("../resources/dictionary_" . $language);

    // if (!$dictFile) header('Location: index.php');
    if (!$dictFile) echo "dictionary not found";

    $dictionary = json_decode($dictFile)["words"];

    $isWord = in_array(strtolower($word), $dictionary);

    echo "<h2 style='color:" . ($isWord ? "green" : "red") . "'>'$word' " . ($isWord ? "is" : "is not") . " a word</h2>";

    ?>
</body>
</html>