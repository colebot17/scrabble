<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$name = $_POST['name'];
$pwd = $_POST['pwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

$name = trim($name); // trim the name

// validate name and password
$nameValid = strlen($name) >= 2; // name must be at least two characters
$pwdValid = strlen($pwd) >= 8; // pwd must be at least eight characters

// require a valid name and password
if (!$nameValid) {
	exit('{"errorLevel":1,"message":"Username must consist of at least two characters."}');
}
if (!$pwdValid) {
	exit('{"errorLevel":1,"message":"Password must consist of at least eight characters."}');
}

// make sure username isn't taken
$sql = "SELECT id FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
if (mysqli_fetch_assoc($query)) {
	exit('{"errorLevel":1,"message":"This username is already taken."}');
}

// escape the username
$name = str_replace("'", "\'", $name);
$name = str_replace('"', '\"', $name);

// hash the password
$hash = password_hash($pwd, PASSWORD_DEFAULT);

// get the datestamp
$datestamp = date("Y-m-d");

// create the account
$sql = "INSERT INTO accounts(name, pwd, games, creationDate) VALUES ('$name', '$hash', '[]', '$datestamp');";
$query = mysqli_query($conn, $sql);
echo '{"errorLevel":0,"message":"Account created successfully."}';

// close the connection
$conn->close();

?>