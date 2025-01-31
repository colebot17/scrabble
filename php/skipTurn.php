<?php

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// get data from client
$user = (int)$_POST['user'];
$pwd = $_POST['pwd'];
$gameId = (int)$_POST['game'];
$redrawLetters = json_decode($_POST['redrawLetters'], true);

// check password
require "verifyPassword.php";
verifyPassword($conn, $user, $pwd);

// make sure the game belongs to the user
$sql = "SELECT games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$userGames = json_decode($row['games'], true);

if (!in_array($gameId, $userGames)) {
	exit('{"errorLevel":2,"message":"You do not own this game!"}');
}

// get the turn, state, players, and letter bag of the game
$sql = "SELECT turn, inactive, players, letterBag FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

$players = json_decode($row['players'], true);
$totalTurn = (int)$row['turn'];
$turn = $totalTurn % count($players);

$inactive = ($row['inactive'] > 0 ? true : false);

$letterBag = json_decode($row['letterBag'], true);

// make sure the game is active
if ($inactive) {
	exit('{"errorLevel":1,"message":"You cannot skip your turn on an inactive game!"}');
}

// make sure it is the user's turn
if ((int)$players[$turn]['id'] !== (int)$user) {
	exit('{"errorLevel":1,"message":"You cannot skip your turn when it isn\'t your turn!"}');
}

// get the index of the current user in the players array
$userIndex;
for ($i=0; $i < count($players); $i++) { 
	if ($players[$i]['id'] == $user) {
		$userIndex = $i;
		break;
	}
}

// generate a long form of the letter bag
$longBag = array();
for ($i = 0; $i < count($letterBag); $i++) { 
	for ($j = 0; $j < array_values($letterBag)[$i]; $j++) { 
		array_push($longBag, array_keys($letterBag)[$i]);
	}
}

// limit the letters to be redrawn to the length of the bag
$redrawLetters = array_slice($redrawLetters, 0, count($longBag));

// redraw the specified letters
$newLetters = [];
for ($i=0; $i < count($redrawLetters); $i++) { // for each letter to be redrawn
	// draw a letter from the long bag
	$rand = random_int(0, count($longBag) - 1);
	$letter = $longBag[$rand];

	// save this to be sent back
	$newLetters[] = Array("index" => $redrawLetters[$i], "letter" => $letter);

	// remove drawn letter from bag and long bag
	$letterBag[$letter]--;
	array_splice($longBag, $rand, 1);
	$longBag = array_values($longBag); // un-associate

	// return the old letter to the letter bag
	// (this will not affect future drawings since we are using the long bag)
	$letterBag[$players[$userIndex]['letterBank'][$redrawLetters[$i]]]++;

	// set the spot in the bank to that letter
	$players[$userIndex]['letterBank'][$redrawLetters[$i]] = $letter;
}

// increment the turn
$totalTurn++;

// increment the subsequent skip counter for the player
if (!$players[$userIndex]['subsequentSkips']) {
	$players[$userIndex]['subsequentSkips'] = 0;
}
$players[$userIndex]['subsequentSkips']++;

// check to see if all players have skipped twice
$endGame = true;
for ($i=0; $i < count($players); $i++) {
	if ($players[$i]['subsequentSkips'] < 2) {
		$endGame = false;
		break;
	}
}
if ($endGame) {
	// if so, end the game
	require "deactivateGame.php";
	$completelyDeleted = deactivate($conn, $gameId, $user, "skip") === "deleted";
}

// encode players and letter bag
$playersJson = json_encode($players);
$letterBagJson = json_encode($letterBag);

// reupload the turn, players, and letter bag
if (!$completelyDeleted) {
	$sql = "UPDATE games SET turn='$totalTurn', players='$playersJson', letterBag='$letterBagJson' WHERE id='$gameId'";
	$query = mysqli_query($conn, $sql);
}

if ($endGame) {
	$res = Array(
		"errorLevel" => 0,
		"status" => 1,
		"completelyDeleted" => $completelyDeleted,
		"message" => "All players have skipped their turns twice in a row, so the game has ended. Good game!"
	);
} else {
	$res = Array(
		"errorLevel" => 0,
		"status" => 0,
		"newLetters" => $newLetters,
		"message" => 'You have skipped your turn' . (count($redrawLetters) > 0 ? ' and exchanged ' . count($redrawLetters) . ' letter' . (count($redrawLetters) === 1 ? '' : 's') : '') . '.'
	);
}
echo json_encode($res);

// notify the next player

$sql = "SELECT name FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$gameName = $row['name'];

$playerNames = Array();
for ($i = 0; $i < count($players); $i++) {
	$pid = $players[$i]['id'];
	$sql = "SELECT name FROM accounts WHERE id='$pid'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$playerNames[] = $row['name'];
	if ($pid === $user) $un = $row['name'];
}

require "notifications/notify.php";
notify($conn, $players[$totalTurn % count($players)]["id"], "turn", Array($un, $gameName, $gameId, $playerNames));


//////////
// add to updates list
//////////

// generate the data
$updateData = Array(
	"player" => $user,
	"playerIndex" => $userIndex,
	"newTurn" => $totalTurn
);

require_once "addUpdate.php";
addUpdate($conn, $gameId, "turnSkip", $updateData);

// close the connection
$conn->close();