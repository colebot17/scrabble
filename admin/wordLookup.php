<?php require "verify.php" ?>

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
    if (!$word) exit("<span style='color:red'><b>Error:</b> no word provided</span>");

    $language = $_GET['language'] ? $_GET['language'] : "english";
    
    // dictionary is not managed by vcs
    $dictFile = file_get_contents("https://scrabble.colebot.com/dictionaries/dictionary_" . $language . ".json");

    if (!$dictFile) exit("<span style='color:red'><b>Error:</b> $language dictionary not found</span>");

    $dictionary = json_decode($dictFile, true)["words"];

    $isWord = in_array(strtolower($word), $dictionary);

    echo "<h2 style='color:" . ($isWord ? "green" : "red") . "'>'$word' " . ($isWord ? "is" : "is not") . " a word in $language</h2>";

    if ($isWord) {
        echo "<a href='removeWord.php?word=$word&language=$language' style='color:red'>Remove</a>";
    } else {
        echo "<a href='addWord.php?word=$word&language=$language'>Make it one</a>";
    }

    ?>

    <br><br>
    <h3>Lookup Another</h3>
    <form method="GET">
        <input type="text" name="word" placeholder="Word" required value="<?php echo $word ?>">
        <select name="language">
            <option value="english"<?php if ($language === 'english') echo " selected" ?>>English</option>
            <option value="spanish"<?php if ($language === 'spanish') echo " selected" ?>>Spanish</option>
            <option value="french"<?php if ($language === 'french') echo " selected" ?>>French</option>
        </select>
        <button>Word Lookup</button>
    </form>
</body>
</html>