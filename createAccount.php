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

// validate name and password
$nameValid = strlen($name) >= 2; // name must be at least two characters
$pwdValid = strlen($pwd) >= 8; // pwd must be at least eight characters

if ($nameValid && $pwdValid) {
	// check if account by name already exists
	$sql = "SELECT id FROM accounts WHERE name='$name'";
	$query = mysqli_query($conn, $sql);
	if (!mysqli_fetch_assoc($query)) {
		// hash the password
		$hash = password_hash($pwd, PASSWORD_DEFAULT);

		// create the account
		$sql = "INSERT INTO accounts(name, pwd, games) VALUES ('$name', '$hash', '[]
			');";
		$query = mysqli_query($conn, $sql);
		echo $name;
	} else {
		echo "0";
	}	
} else {
	echo "0";
}

// close the connection
$conn->close();

?>