<?php

// get data from GET/POST
$gameId = (int)$_POST['game'];
$tiles = json_decode($_POST['tiles'], true);
$user = (int)$_POST['user'];
$pwd = $_POST['pwd'];

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
require "verifyPassword.php";
verifyPassword($conn, $user, $pwd);

// make sure the user has actually placed something
if (!$tiles) {
    exit('{"errorLevel":1,"message":"You must place at least one tile to make a move."}');
}

// get game information
$sql = "SELECT turn, inactive, endDate, letterBag, players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// decode game information
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

// store the tiles as a draft
require "draft/draft.php";
$draft = Array();
for ($i = 0; $i < count($tiles); $i++) {
	$draft[] = Array(
		"bankIndex" => $tiles[$i]["bankIndex"],
		"letter" => $tiles[$i]["letter"],
		"pos" => Array(
			$tiles[$i]["x"],
			$tiles[$i]["y"]
		)
	);
}
setDraft($conn, $user, $gameId, $draft);

// get the word list
require "parseWords.php";
$result = parseWords($gameId, $tiles, $user);
$decodedResult = json_decode($result, true);

// send back an error if there was one
if ($decodedResult && array_key_exists('errorLevel', $decodedResult)) {
    exit($result);
}

// now we can look at the words as normal
$words = $decodedResult;

// add words to a list
$newWordsList = Array();
for ($i=0; $i < count($words); $i++) { 
	if ($words[$i]["placeholder"]) {
		continue;
	}
	$newWord = Array(
		"word" => $words[$i]["word"],
		"player" => (int)$user,
		"turn" => (int)$totalTurn,
		"points" => $words[$i]["points"],
		"axis" => $words[$i]["axis"],
		"cross" => $words[$i]["cross"],
		"pos" => Array(
			"start" => $words[$i]["start"],
			"end" => $words[$i]["end"]
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