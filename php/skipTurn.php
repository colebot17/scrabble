<?php 

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// get data from client
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];
$redrawLetters = json_decode($_POST['redrawLetters'], true);

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

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
for ($i=0; $i < count($redrawLetters); $i++) { // for each letter to be redrawn
	// draw a letter from the long bag
	$rand = random_int(0, count($longBag) - 1);
	$letter = $longBag[$rand];

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
	$deleteGame = true;
	for ($i=0; $i < count($players); $i++) { 
		if ($players[$i]['points'] > 0) {
			$deleteGame = false;
			break;
		}
	}

	if ($deleteGame) { // if no players in the game have scored points
		// remove the game from all players
		for ($i=0; $i < count($players); $i++) { 
			$sql = "SELECT games FROM accounts WHERE id='$players[$i][`id`]'";
			$query = mysqli_query($conn, $sql);
			$row = mysqli_fetch_assoc($query);

			$playersGames = json_decode($row['games'], true);
			if (($key = array_search($gameId, $playersGames)) !== false) {
				unset($playersGames[$key]);
			}
			$playerGames = json_encode(array_values($playerGames));

			$sql = "UPDATE accounts SET games='$playerGames' WHERE id='$playerList[$i]'";
			$query = mysqli_query($conn, $sql);
		}

		// delete the game
		$sql = "DELETE FROM games WHERE id='$gameId'";
		$query = mysqli_query($conn, $sql);
	} else { // if players have already scored points
		// deactivate the game
		$sql = "UPDATE games SET inactive=1 WHERE id='$gameId'";
		$query = mysqli_query($conn, $sql);

		// set the endDate
		$datestamp = date("Y-m-d");
		$sql = "UPDATE games SET endDate='$datestamp' WHERE id='$gameId'";
		$query = mysqli_query($conn, $sql);
	}
}

// encode players and letter bag
$playersJson = json_encode($players);
$letterBagJson = json_encode($letterBag);

// reupload the turn, players, and letter bag
$sql = "UPDATE games SET turn='$totalTurn', players='$playersJson', letterBag='$letterBagJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

if ($endGame) {
	echo '{"errorLevel":0,"status":1,"message":"All players have skipped their turns twice in a row, so the game has ended. Good game!"}';
} else {
	echo '{"errorLevel":0,"status":0,"message":"You have skipped your turn' . (count($redrawLetters) > 0 ? ' and exchanged ' . count($redrawLetters) . ' letter' . (count($redrawLetters) === 1 ? '' : 's') : '') . '."}';
}

// add to update list
$sql = "SELECT updates FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$updates = json_decode($row['updates'], true);

array_push($updates, Array(
    "type" => "turnSkip",
    "data" => Array(
        "player" => $user,
		"playerIndex" => $userIndex,
		"turnSkipped" => $totalTurn
    )
));

if ($endGame) {
	array_push($updates, Array(
		"type" => "gameEnd",
		"data" => Array(
			"player" => $user,
			"playerIndex" => array_search($user, $playerList),
			"reason" => "skip"
		),
		"timestamp" => time()
	));
}

$updatesJson = json_encode($updates);
$updatesJson = str_replace("'", "\'", $updatesJson);
$updatesJson = str_replace('"', '\"', $updatesJson);
$sql = "UPDATE games SET updates='$updatesJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

// close the connection
$conn->close();

?>