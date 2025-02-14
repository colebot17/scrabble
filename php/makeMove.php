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
$sql = "SELECT board, turn, inactive, endDate, letterBag, players, name FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// decode game information
$board = json_decode($row['board'], true);
$totalTurn = $row['turn'];
$inactive = $row['inactive'];
$endDate = $row['endDate'];
$players = json_decode($row['players'], true);
$letterBag = json_decode($row['letterBag'], true);

$gameName = $row['name']; // used by the email system near the bottom of this file

$turn = $totalTurn % count($players);

// get an array of all player ids
$playerList = Array();
for ($i=0; $i < count($players); $i++) { 
	array_push($playerList, $players[$i]['id']);
}
$currentPlayerIndex = array_search($user, $playerList);

if ((int)$players[$turn]['id'] !== (int)$user || (int)$inactive !== 0) { // make sure it is actually the user's turn and that the game is active
	exit('{"errorLevel":1,"message":"It isn\'t your turn!"}');
}

// make sure there is a bank order
if (!$players[$currentPlayerIndex]['bankOrder']) {
	$players[$currentPlayerIndex]['bankOrder'] = array();
	for ($i=0; $i < count($players[$currentPlayerIndex]['letterBank']); $i++) { 
		array_push($players[$currentPlayerIndex]['bankOrder'], $i);
	}
}

$addedTiles = Array();

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
		"blank"     => $tiles[$i]['blank'],
		"letter"    => $tiles[$i]['letter'],
		"locked"    => true,
		"turn"      => (int)$totalTurn,
		"x"         => $tiles[$i]['x'],
		"y"         => $tiles[$i]['y']
	);

	// add tile to board
	$board[$tile['y']][$tile['x']] = $tile;
	array_push($addedTiles, $tile);

	// remove the letter from the user's bank and bank order
	unset($players[$currentPlayerIndex]['letterBank'][$tiles[$i]['bankIndex']]);
	unset($players[$currentPlayerIndex]['bankOrder'][array_search($tiles[$i]['bankIndex'], $players[$currentPlayerIndex]['bankOrder'])]);
}

// make sure the letter bank and bank order are not associative
$players[$currentPlayerIndex]['letterBank'] = array_values($players[$currentPlayerIndex]['letterBank']);
$players[$currentPlayerIndex]['bankOrder'] = array_values($players[$currentPlayerIndex]['bankOrder']);

// import the parse words function
require "parseWords.php";

// get the result from the function
$result = parseWords($gameId, $tiles, $user);
$decodedResult = json_decode($result, true);

// make sure there wasn't an error
if (array_key_exists('errorLevel', $decodedResult) && $decodedResult['errorLevel']) {
	exit($result);
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
}

// update the points in the player obj
$pointsSum = 0;
for ($i=0; $i < count($words); $i++) { 
	$pointsSum += $words[$i]["points"];
}
$players[$currentPlayerIndex]['points'] = $players[$currentPlayerIndex]['points'] + $pointsSum;

$newLettersList = Array();

// fill the player's letter bank until it is full or the bag is empty
$bankIndex = count($players[$currentPlayerIndex]['letterBank']);
while (count($players[$currentPlayerIndex]['letterBank']) < 7 && count($longBag) > 0) {
	$rand = random_int(0, count($longBag) - 1);
	$newLetter = $longBag[$rand];
	array_splice($longBag, $rand, 1);
	$letterBag[$newLetter]--;
	array_push($players[$currentPlayerIndex]['letterBank'], $newLetter);
	$newLettersList[] = count($players[$currentPlayerIndex]['letterBank']) - 1;
	$bankIndex++;
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

// reset the subsequent skip counter for the player
unset($players[$currentPlayerIndex]['subsequentSkips']);

// get the words list
$sql = "SELECT words FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$wordsList = json_decode($row["words"], true);

// add words to the list
$newWordsList = Array();
for ($i = 0; $i < count($words); $i++) { 
	if (array_key_exists('placeholder', $words[$i]) && $words[$i]['placeholder']) {
		$newWord = Array(
			"placeholder" => true,
			"type" => "allLetterBonus",
			"player" => (int)$user,
			"turn" => (int)$totalTurn,
			"points" => $words[$i]["points"]
		);
		array_push($newWordsList, $newWord);
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
$allWords = array_merge($wordsList, $newWordsList);

// encode as JSON
$wordsJson = json_encode($allWords);

if (!$inactive) $totalTurn++; // increment the turn

// upload the new game data
$letterBagJson = json_encode($letterBag);
$boardJson = json_encode($board);
$playersJson = json_encode($players);

$sql = "UPDATE games SET letterBag='$letterBagJson',players='$playersJson',turn='$totalTurn',endDate='$endDate',board='$boardJson',words='$wordsJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

// end the game if it is over
if ($inactive) {
	require "deactivateGame.php";
	deactivate($conn, $gameId, $user, "move");
	// the game should never be completely deleted in this case
}

// return the response
$response = Array(
	"errorLevel" => 0,
	"status" => ($inactive ? 1 : 0),
	"message" => "Your move has been recorded" . ($inactive ? " and the game has ended. Good job!" : "."),
	"data" => Array(
		"newWords" => $newWordsList,
		"newLetterIndices" => $newLettersList
	)
);
echo json_encode($response);


// remove the player's draft
require "draft/draft.php";
setDraft($conn, $user, $gameId, null);


// notify the next player

$playerList = Array();
for ($i = 0; $i < count($players); $i++) {
	$pid = $players[$i]['id'];
	$sql = "SELECT name FROM accounts WHERE id='$pid'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$playerList[] = $row['name'];
	if ($pid === $user) $un = $row['name'];
}

require "notifications/notify.php";
notify($conn, $players[$totalTurn % count($players)]["id"], "turn", Array($un, $gameName, $gameId, $playerList));

//////////
// add to updates list
//////////

// generate the data
$updateData = Array(
	"player" => $user,
	"playerIndex" => $currentPlayerIndex,
	"tiles" => $addedTiles,
	"newPoints" => $pointsSum
);

require_once "addUpdate.php";
addUpdate($conn, $gameId, "move", $updateData);

// close the connection
$conn->close();