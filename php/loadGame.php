<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
require "verifyPassword.php";
verifyPassword($conn, $user, $pwd);

// check game ownership
$sql = "SELECT games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

if (!in_array($gameId, json_decode($row['games'], true))) {
	exit('{"errorLevel":2,"message":"You don\'t have permission to load this game!"}');
}
	
$sql = "SELECT name, lang, letterBag, players, turn, inactive, board, words, creationDate, endDate, chat, updates FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

$name = $row['name'];
$lang = $row['lang'];
$letterBag = json_decode($row['letterBag'], true);
$turn = (int)$row['turn'];
$inactive = ((int)$row['inactive'] === 1 ? true : false);
$board = json_decode($row['board'], true);
$words = json_decode($row['words'], true);
$creationDate = $row['creationDate'];
$endDate = $row['endDate'];
$players = json_decode($row['players'], true);
$chat = json_decode($row['chat'], true);
$updateNumber = count(json_decode($row['updates'], true));

// get the number of letters left in the letter bag
$lettersLeft = 0;
for ($i = 0; $i < count(array_values($letterBag)); $i++) {
	$lettersLeft += array_values($letterBag)[$i];
}

// start a name buffer
$nameBuffer = Array(); // this will fill up with id => name

function getName(int $id) : string {
	if (array_key_exists($id, $GLOBALS['nameBuffer'])) return $GLOBALS['nameBuffer'][$id];

	$sql = "SELECT name FROM accounts WHERE id='$id'";
	$query = mysqli_query($GLOBALS['conn'], $sql);
	$row = mysqli_fetch_assoc($query);
	
	$name = $row['name'];
	$GLOBALS['nameBuffer'][$id] = $name;
	return $name;
}

// prepare the players list to be sent back
for ($i = 0; $i < count($players); $i++) {
	// get the username
	$players[$i]['name'] = getName($players[$i]['id']);

	// make sure the player id is an int
	$players[$i]['id'] = (int)$players[$i]['id'];

	// add the bank count
	$players[$i]['bankCount'] = count($players[$i]['letterBank']);
	
	// remove the letter bank from all players other than the current user - no cheating!
	if ($players[$i]['id'] != $user) {
		unset($players[$i]['letterBank']);
		unset($players[$i]['bankOrder']);
		unset($players[$i]['chatRead']);
	}
}

// add usernames into the words list using the players list
for ($i = 0; $i < count($words); $i++) {
	$words[$i]['playerName'] = getName($words[$i]['player']);
};

// find the names of users who send chat messages
// and remove message content from deleted messages
for ($i = 0; $i < count($chat); $i++) {
	// only look over user messages
	if ($chat[$i]['type'] !== 'user') continue;
	
	$senderId = $chat[$i]['sender'];
	$senderName = '';
	$chat[$i]['senderName'] = getName($senderId);
	if (array_key_exists('deleted', $chat[$i]) && $chat[$i]['deleted']) {
		unset($chat[$i]['message']);
	}
}

// determine if the nudge button should be enabled
require "canNudge.php";
$nudgeEnabled = canNudge($conn, $user, $gameId)[0];

// calculate the winning players
$winningPoints = 0;
for ($i = 0; $i < count($players); $i++) {
	if ($players[$i]["points"] > $winningPoints) $winningPoints = $players[$i]["points"];
}
$winnerIndices = Array();
for ($i = 0; $i < count($players); $i++) {
	if ($players[$i]["points"] === $winningPoints) $winnerIndices[] = $i;
}

// put it all together
$obj = Array(
	"id"            => (int)$gameId,
	"name"          => $name,
	"lang"          => $lang,
	"lettersLeft"   => (int)$lettersLeft,
	"players"       => $players,
	"turn"          => (int)$turn,
	"inactive"      => $inactive,
	"board"         => $board,
	"words"         => $words,
	"creationDate"  => $creationDate,
	"endDate"       => ($inactive ? $endDate : null),
	"chat"          => $chat,
	"updateNumber"  => $updateNumber,
	"nudgeEnabled"  => $nudgeEnabled,
	"winnerIndices" => $winnerIndices
);

// get the draft
require "draft/draft.php";
$draft = getDraft($conn, $user, $gameId);
if ($draft) $obj["draft"] = $draft;

$res = Array(
	"errorLevel" => 0,
	"data" => $obj,
	"message" => "Game loaded successfully."
);

echo json_encode($res);

// close the connection
$conn->close();