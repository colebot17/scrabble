<?php if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== '96819822') header('Location: validate.php');?>

<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/x-icon" href="favicon.ico"/>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Word - Scrabble Admin Panel</title>
</head>
<body>
    <h3>This is the admin panel for scrabble.colebot.com<br><a href="index.php">Admin Home</a></h3>
    <h1>Add Word</h1>
    <?php

    $word = strtolower($_GET['word']);
    if (!$word) exit("<span style='color:red'><b>Error:</b> no word provided</span>");

    $language = $_GET['language'] ? $_GET['language'] : "english";
    
    // dictionary is not managed by vcs
    $dictPath = "/home/hfcyju9l2xme/scrabble.colebot.com/dictionaries/dictionary_$language.json";
    $dictFile = file_get_contents($dictPath);

    if (!$dictFile) exit("<span style='color:red'><b>Error:</b> $language dictionary not found</span>");

    $dictionary = json_decode($dictFile, true)["words"];

    $isWord = in_array($word, $dictionary);
    if (!$isWord) { // we don't want any duplicates
        $dictionary[] = $word;
        if (file_put_contents($dictPath, json_encode(Array("words" => $dictionary)))) {
            echo "<h2 style='color:green'>'$word' is a word now!</h2>";
            echo "<a href='wordLookup.php?word=$word&language=$language'>Done</a> ";
            echo "<a href='removeWord.php?word=$word&language=$language'>Undo</a>";

            header("Location: wordLookup.php?word=$word&language=$language");
        } else {
            echo "<span style='color:red'><b>Error:</b> couldn't update dictionary</span>";
            echo "<br><br><a href='wordLookup.php?word=$word&language=$language'>Back</a>";
        }
    } else {
        echo "<h2 style='color:green'><b>'$word'</b> is already a word!</h2>";
        echo "<a href='wordLookup.php?word=$word&language=$language'>Back</a>";
    }

    ?>
</body>
</html>