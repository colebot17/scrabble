<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$gameId = $_POST['game'];
$tiles = $_POST['tiles']; // already an array
$user = $_POST['user'];
$pwd = $_POST['pwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get game information
$sql = "SELECT board, turn, inactive, endDate, letterBag, players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// decode game information
$board = json_decode($row['board'], true);
$totalTurn = $row['turn'];
$inactive = $row['inactive'];
$endDate = $row['endDate'];
$players = json_decode($row['players'], true);
$letterBag = json_decode($row['letterBag'], true);

$turn = $totalTurn % count($players);

// get an array of all player ids
$playerList = Array();
for ($i=0; $i < count($players); $i++) { 
	array_push($playerList, $players[$i]['id']);
}
$currentPlayerIndex = array_search($user, $playerList);

// add the tiles to the board
for ($i = 0; $i < count($tiles); $i++) { // for each tile the user is trying to place
	// make sure tiles are only being placed on empty spaces
	if ($board[$tiles[$i]["y"]][$tiles[$i]["x"]]) {
		exit('{"errorLevel":2,"message":"You cannot place a tile over another tile."}');
	}

	// make sure player owns all letters being placed
	if ($players[$currentPlayerIndex]["letterBank"][$tiles["bankIndex"]] !== $letter) {
		exit('{"errorLevel":2,"message":"You must own all letters being used."}');
	}

	// generate a tile with only the information we need
	$tile = Array(
		"bankIndex" => $tiles[$i]['bankIndex'],
		"blank" => $tiles[$i]['blank'],
		"letter" => $tiles[$i]['letter'],
		"turn" => (int)$totalTurn,
		"x" => $tiles[$i]['x'],
		"y" => $tiles[$i]['y']
	);

	// add tile to board
	$board[$tile['y']][$tile['x']] = $tile;

	// remove the letter from the user's bank and bank order
	unset($players[$currentPlayerIndex]['letterBank'][$tiles[$i]['bankIndex']]);
	unset($players[$currentPlayerIndex]['bankOrder'][array_search($tiles[$i]['bankIndex'], $players[$currentPlayerIndex]['bankOrder'])]);
}

// get the word list
require "parseWords.php";
$result = parseWords($gameId, $tiles, $user);
$decodedResult = json_decode($result, true);

// send back an error if there was one
if ($decodedResult['errorLevel']) {
    exit($result);
}

// now we can look at the words as normal
$words = $decodedResult;
$wordsKeys = array_keys($words);

// add words to a list
$newWordsList = Array();
for ($i=0; $i < count($wordsKeys); $i++) { 
	if ($words[$wordsKeys[$i]]["placeholder"]) {
		continue;
	}
	$newWord = Array(
		"word" => $wordsKeys[$i],
		"player" => (int)$user,
		"turn" => (int)$totalTurn,
		"points" => $words[$wordsKeys[$i]]["points"],
		"axis" => $words[$wordsKeys[$i]]["axis"],
		"cross" => $words[$wordsKeys[$i]]["cross"],
		"pos" => Array(
			"start" => $words[$wordsKeys[$i]]["start"],
			"end" => $words[$wordsKeys[$i]]["end"]
		)
	);
	array_push($newWordsList, $newWord);
}

// calculate the total new points
$newPoints = 0;
for ($i=0; $i < count($words); $i++) { 
    $newPoints += $words[$i]["points"];
}

// return the response
$response = Array(
	"errorLevel" => 0,
	"message" => "If you make this move, you will score " . $newPoints . " points.",
	"data" => Array(
		"newWords" => $newWordsList,
        "newPoints" => $newPoints
	)
);
echo json_encode($response);

// close the connection
$conn->close();

?>