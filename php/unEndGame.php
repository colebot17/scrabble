<?php

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// get data from POST
$userId = (int)$_POST['user'];
$pwd = $_POST['pwd'];
$gameId = (int)$_POST['game'];

// check password
require "verifyPassword.php";
verifyPassword($conn, $userId, $pwd);

// get the player list from the server
$sql = "SELECT players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$players = json_decode($row['players'], true);

// set the endGameRequest property for the current user
$currentPlayerIndex;
for ($i = 0; $i < count($players); $i++) {
	if ((int)$players[$i]['id'] === $userId) {
		$players[$i]['endGameRequest'] = false;
		$currentPlayerIndex = $i;
		break;
	}
}

// reupload the player list to the server
$playersJson = json_encode($players);
$sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

echo '{"errorLevel":0,"message":"Your vote to end the game has been revoked."}';

//////////
// add to updates list
//////////

// generate the data
$updateData = Array(
	"player" => $userId,
	"playerIndex" => $currentPlayerIndex
);

require "addUpdate.php";
addUpdate($conn, $gameId, "gameEndVoteRevoke", $updateData);

// add system message to chat
require "chat/addSystemChatMessage.php";
$data = Array(
	"playerId" => $userId
);
addSystemChatMessage($conn, $gameId, "gameEndVoteRevoke", $data);

// close the connection
mysqli_close($conn);

?>