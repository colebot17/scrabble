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

// import the parse words function
require "parseWords.php";

// get the result from the function
$result = parseWords($gameId, $tiles, $user);
$decodedResult = json_decode($result, true);

// make sure there wasn't an error
if ($decodedResult['errorLevel']) {
	exit($decodedResult);
}

// now we can continue as normal
$words = $decodedResult;

// lock the board and make sure everything is in boolean format
for ($y = 0; $y < 15; $y++) { 
	for ($x = 0; $x < 15; $x++) {
		if ($board[$y][$x]) {
			$board[$y][$x]['locked'] = true;
			if ($board[$y][$x]['blank'] === 'true') {
				$board[$y][$x]['blank'] = true;
			} else if ($board[$y][$x]['blank'] === 'false') {
				$board[$y][$x]['blank'] = false;
			}
		}
	}
}

// check for the end of the game
$longBag = array();
for ($i = 0; $i < count($letterBag); $i++) { 
	for ($j = 0; $j < array_values($letterBag)[$i]; $j++) { 
		array_push($longBag, array_keys($letterBag)[$i]);
	}
}

// if the letter bank of the current player and the letter bag are both empty,
if (count($players[$currentPlayerIndex]['letterBank']) === 0 && count($longBag) === 0) {
	$inactive = 1; // end the game

	// set the endDate
	$datestamp = date("Y-m-d");
	$endDate = $datestamp;
}

// update the points in the player obj
$pointsSum = 0;
for ($i=0; $i < count($words); $i++) { 
	$pointsSum += $words[$wordsKeys[$i]]["points"];
}
$players[$currentPlayerIndex]['points'] = $players[$currentPlayerIndex]['points'] + $pointsSum;

// if the game is not ending and there is at least one letter in the bag
if (!$inactive && count($longBag) > 0) {
	// fill the player's letter bank until it is full or the bag is empty
	$bankIndex = count($players[$currentPlayerIndex]['letterBank']);
	while (count($players[$currentPlayerIndex]['letterBank']) < 7 && count($longBag) > 0) {
		$rand = random_int(0, count($longBag) - 1);
		$newLetter = $longBag[$rand];
		array_splice($longBag, $rand, 1);
		$letterBag[$newLetter]--;
		array_push($players[$currentPlayerIndex]['letterBank'], $newLetter);
		$bankIndex++;
	}
}

// make sure there aren't ghost tiles in the bank order
$bankCount = count($players[$currentPlayerIndex]['letterBank']);
$bankOrderCount = count($players[$currentPlayerIndex]['bankOrder']);
for ($i=0; $i < $bankOrderCount; $i++) {
	if ($players[$currentPlayerIndex]['bankOrder'][$i] >= $bankCount) {
		unset($players[$currentPlayerIndex]['bankOrder'][$i]);
	}
}

// disassociate
$players[$currentPlayerIndex]['bankOrder'] = array_values($players[$currentPlayerIndex]['bankOrder']);

// make sure every letter in the bank is represented in the bank order
for ($i=0; $i < count($players[$currentPlayerIndex]['letterBank']); $i++) { 
	array_push($players[$currentPlayerIndex]['bankOrder'], (int)$i);
}

// remove duplicates from the bank order
$players[$currentPlayerIndex]['bankOrder'] = array_values(array_unique($players[$currentPlayerIndex]['bankOrder']));

// disassociate the bank order
$players[$currentPlayerIndex]['bankOrder'] = array_values($players[$currentPlayerIndex]['bankOrder']);

if (!$inactive) {
	$totalTurn++; // increment the turn
}

// reset the subsequent skip counter for the player
unset($players[$currentPlayerIndex]['subsequentSkips']);


// get the words list
$sql = "SELECT words FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$wordsList = json_decode($row["words"], true);

// add words to the list
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
$allWords = array_merge($wordsList, $newWordsList);

// encode as JSON
$wordsJson = json_encode($allWords);

// upload the new game data
$letterBagJson = json_encode($letterBag);
$boardJson = json_encode($board);
$playersJson = json_encode($players);

$sql = "UPDATE games SET letterBag='$letterBagJson',players='$playersJson',turn='$totalTurn',inactive='$inactive',endDate='$endDate',board='$boardJson',words='$wordsJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

// return the response
$response = Array(
	"errorLevel" => 0,
	"status" => ($inactive ? 1 : 0),
	"message" => "Your move has been recorded" . ($inactive ? " and the game has ended. Good job!" : "."),
	"data" => Array(
		"newWords" => $newWordsList
	)
);
echo json_encode($response);

// close the connection
$conn->close();

?>