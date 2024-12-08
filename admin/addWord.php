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

    $word = strtolower($_GET['word']);
    if (!$word) echo "<span style='color:red'><b>Error:</b> no word provided</span>";

    $language = $_GET['language'] ? $_GET['language'] : "english";
    
    // dictionary is not managed by vcs
    $dictPath = "https://scrabble.colebot.com/dictionaries/dictionary_$language.json";
    $dictFile = file_get_contents($dictPath);

    if (!$dictFile) echo "<span style='color:red'><b>Error:</b> $language dictionary not found</span>";

    $dictionary = json_decode($dictFile, true)["words"];

    $isWord = in_array($word, $dictionary);
    if (!$isWord) { // we don't want any duplicates
        $dictionary[] = $word;
        if (file_put_contents($dictPath, json_encode(Array("words" => $dictionary)))) {
            echo "<h2>'$word' is a word now!</h2>";
        } else {
            echo "<span style='color:red'><b>Error:</b> couldn't update dictionary</span>";
        }
    } else {
        echo "<span style='color:green'>'$word' is already a word!</span>";
    }

    ?>
</body>
</html>