<?php

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



$sql = "SELECT id, words FROM games";
$query = mysqli_query($conn, $sql);

while ($row = mysqli_fetch_assoc($query)) {
    $id = $row['id'];
    $words = json_decode($row['words'], true);

    for ($i = 0; $i < count($words); $i++) {
        $words[$i]["turn"]--;
    }

    echo 'Converting game ' . $id . '...';

    $wordsJson = json_encode($words);
    $sql2 = "UPDATE games SET words='$wordsJson' WHERE id='$id'";
    $query2 = mysqli_query($conn, $sql2);
}


