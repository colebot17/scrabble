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

require "../php/notifications/notify.php";

echo json_encode(notify($conn, 1, "nudge", Array("Boyy", "GAMie", 133, Array("Calvin", "Harris", "Mitchell"))));