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

if (!$tiles) {
	exit('{"errorLevel":1,"message":"You must place at least one tile to make a move."}');
}

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
$sql = "SELECT board, turn, inactive, letterBag, players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// decode game information
$board = json_decode($row['board'], true);
$totalTurn = $row['turn'];
$inactive = $row['inactive'];
$players = json_decode($row['players'], true);
$letterBag = json_decode($row['letterBag'], true);

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

	// remove the letter from the user's bank
	unset($players[$currentPlayerIndex]['letterBank'][$tiles[$i]['bankIndex']]);
}

// make sure the letter bank and bank order are not associative
$players[$currentPlayerIndex]['letterBank'] = array_values($players[$currentPlayerIndex]['letterBank']);

// make sure tiles are in straight line
$xs = Array();
$ys = Array();
for ($i = 0; $i < count($tiles); $i++) {
	array_push($xs, $tiles[$i]["x"]);
	array_push($ys, $tiles[$i]["y"]);
}
$onAxisY = true;
for ($i = 0; $i < count($xs); $i++) {
	if ($xs[$i] !== $xs[0]) {
		$onAxisY = false;
		break;
	}
}
$onAxisX = true;
for ($i = 0; $i < count($ys); $i++) {
	if ($ys[$i] !== $ys[0]) {
		$onAxisX = false;
		break;
	}
}
if (!$onAxisX && !$onAxisY) {
	exit('{"errorLevel":1,"message":"You can only enter one word per turn."}');
}

// make sure all tiles are connected to the center of the board
// using a four-way flood fill with a queue for storage
// https://en.wikipedia.org/wiki/Flood_fill

// make a copy of the board that is simpler
$boardCopy = Array();
for ($y=0; $y < 15; $y++) { 
	array_push($boardCopy, Array());
	for ($x=0; $x < 15; $x++) {
		if ($board[$y][$x]["connected"]) {
			$val = "connected";
		} else if ($board[$y][$x]) {
			$val = "tile";
		} else {
			$val = "empty";
		}
		array_push($boardCopy[$y], $val);
	}
}

$queue = Array();
array_push($queue, Array("val" => "connected", "x" => 7, "y" => 7));
while (count($queue) > 0) {
	$item = $queue[0];
	unset($queue[0]);
	$queue = array_values($queue);
	if ($boardCopy[$item["y"]][$item["x"]] !== "empty") {
		$boardCopy[$item["y"]][$item["x"]] = "connected";
		if ($boardCopy[$item["y"]][$item["x"] + 1] === "tile") {
			array_push($queue, Array("val" => $boardCopy[$item["y"]][$item["x"] + 1], "x" => $item["x"] + 1, "y" => $item["y"]));
		}
		if ($boardCopy[$item["y"]][$item["x"] - 1] === "tile") {
			array_push($queue, Array("val" => $boardCopy[$item["y"]][$item["x"] - 1], "x" => $item["x"] - 1, "y" => $item["y"]));
		}
		if ($boardCopy[$item["y"] + 1][$item["x"]] === "tile") {
			array_push($queue, Array("val" => $boardCopy[$item["y"] + 1][$item["x"]], "x" => $item["x"], "y" => $item["y"] + 1));
		}
		if ($boardCopy[$item["y"] - 1][$item["x"]] === "tile") {
			array_push($queue, Array("val" => $boardCopy[$item["y"] - 1][$item["x"]], "x" => $item["x"], "y" => $item["y"] - 1));
		}
	}
}

for ($y = 0; $y < 15; $y++) { 
	for ($x = 0; $x < 15; $x++) { 
		if ($boardCopy[$y][$x] === "tile") {
			exit('{"errorLevel":1,"message":"All tiles must be connected to the center of the board."}');
		}
	}
}

// go ahead and get the two json files we will need: board.json and dictionary.json
$boardInfo = json_decode(file_get_contents('board.json'), true);
$dictionary = json_decode(file_get_contents('dictionary.json'), true);

// the complicated part...

// find out points as we go!!!
// store in assoc array
// points should take into account the pattern of the board
// don't worry about single letters at all (just ignore them)

// convert all boolean properties in the board to boolean values
for ($y=0; $y < 15; $y++) { 
	for ($x=0; $x < 15; $x++) { 
		if ($board[$y][$x]) {
			if ($board[$y][$x]['locked'] === 'true') {
				$board[$y][$x]['locked'] = true;
			} else if ($board[$y][$x]['locked'] === 'false') {
				$board[$y][$x]['locked'] = false;
			}

			if ($board[$y][$x]['blank'] === 'true') {
				$board[$y][$x]['blank'] = true;
			} else if ($board[$y][$x]['blank'] === 'false') {
				$board[$y][$x]['blank'] = false;
			}
		}
	}
}

$words = Array();

// sweep x axis
if ($onAxisX) {
	$x = $tiles[0]["x"];
	$y = $tiles[0]["y"];

	$xAxisWord = "";
	$xAxisWordPoints = 0;
	$xAxisWordMultiplier = 1;

	for ($i = 0; $i < 2; $i++) { // repeat twice (each direction from center tile)
		// set start point based on sweep direction
		$sweepX = ($i === 0 ? $x : $x - 1);

		while ($board[$y][$sweepX]) { // sweep left/right
			// add central letter from main axis
			$xAxisWord = ($i === 0 ? $xAxisWord . $board[$y][$sweepX]["letter"] : $board[$y][$sweepX]["letter"] . $xAxisWord);

			// add points times letter multiplier if not locked
			if (!$board[$y][$sweepX]["blank"]) { // unless is is a blank tile
				$xAxisWordPoints = $xAxisWordPoints + $boardInfo["letterScores"][strtoupper($board[$y][$sweepX]["letter"])] * (!$board[$y][$sweepX]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$y][$sweepX]]["letter"] : 1);
			}

			// multiply multiplier by word multiplier if not locked
			$xAxisWordMultiplier *= (!$board[$y][$sweepX]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$y][$sweepX]]["word"] : 1);

			// only sweep the cross axis if the letter isn't locked
			if (!$board[$y][$sweepX]["locked"]) {
				$xCrossAxisWord = "";
				$xCrossAxisWordPoints = 0;
				$xCrossAxisWordMultiplier = 1;

				for ($j = 0; $j < 2; $j++) { // repeat twice (each direction from center tile)
					// set start point based on sweep direction
					$sweepY = ($j === 0 ? $y : $y - 1);

					while ($board[$sweepY][$sweepX]) { // sweep up/down
						// add letter to cross axis word
						// (sweeping right ? add to right : add to left)
						$xCrossAxisWord = ($j === 0 ? $xCrossAxisWord . $board[$sweepY][$sweepX]["letter"] : $board[$sweepY][$sweepX]["letter"] . $xCrossAxisWord);

						// add points times letter multiplier if not locked
						if (!$board[$sweepY][$sweepX]["blank"]) { // unless it is a blank tile
							$xCrossAxisWordPoints = $xCrossAxisWordPoints + $boardInfo["letterScores"][strtoupper($board[$sweepY][$sweepX]["letter"])] * (!$board[$sweepY][$sweepX]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$sweepY][$sweepX]]["letter"] : 1);
						}

						// multiply multiplier by word multiplier if not locked
						$xCrossAxisWordMultiplier *= (!$board[$sweepY][$sweepX]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$sweepY][$sweepX]]["word"] : 1);

						($j === 0 ? $sweepY++ : $sweepY--); // increment/decrement based on sweep direction
					}
				}
				
				// compile the x cross axis word and points into the array if it is long enough
				if (strlen($xCrossAxisWord) > 1) {
					$words[$xCrossAxisWord] = $xCrossAxisWordPoints * $xCrossAxisWordMultiplier;
				}
			}

			($i === 0 ? $sweepX++ : $sweepX--); // increment/decrement based on sweep direction
		}
	}

	// compile the x axis word and points into the array if it is long enough
	if (strlen($xAxisWord) > 1) {
		$words[$xAxisWord] = $xAxisWordPoints * $xAxisWordMultiplier;
	}
}

// sweep y axis
if ($onAxisY) {
	$x = $tiles[0]["x"];
	$y = $tiles[0]["y"];

	$yAxisWord = "";
	$yAxisWordPoints = 0;
	$yAxisWordMultiplier = 1;

	for ($i = 0; $i < 2; $i++) { // repeat twice (each direction from center tile)
		// set start point based on sweep direction
		$sweepY = ($i === 0 ? $y : $y - 1);

		while ($board[$sweepY][$x]) { // sweep up/down
			// add central letter from main axis
			$yAxisWord = ($i === 0 ? $yAxisWord . $board[$sweepY][$x]["letter"] : $board[$sweepY][$x]["letter"] . $yAxisWord);

			// add points times letter multiplier if not locked
			if (!$board[$sweepY][$x]["blank"]) { // unless it is a blank tile
				$yAxisWordPoints = $yAxisWordPoints + $boardInfo["letterScores"][strtoupper($board[$sweepY][$x]["letter"])] * (!$board[$sweepY][$x]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$sweepY][$x]]["letter"] : 1);
			}
			// multiply multiplier by word multiplier if not locked
			$yAxisWordMultiplier *= (!$board[$sweepY][$x]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$sweepY][$x]]["word"] : 1);

			// only sweep the cross axis if the letter isn't locked
			if (!$board[$sweepY][$x]["locked"]) {
				$yCrossAxisWord = "";
				$yCrossAxisWordPoints = 0;
				$yCrossAxisWordMultiplier = 1;

				for ($j = 0; $j < 2; $j++) { // repeat twice (each direction from center tile)
					// set start point based on sweep direction
					$sweepX = ($j === 0 ? $x : $x - 1);

					while ($board[$sweepY][$sweepX]) { // sweep left/right
						// add letter to cross axis word
						// (sweeping down ? add to right : add to left)
						$yCrossAxisWord = ($j === 0 ? $yCrossAxisWord . $board[$sweepY][$sweepX]["letter"] : $board[$sweepY][$sweepX]["letter"] . $yCrossAxisWord);

						// add points times letter multiplier if not locked
						if (!$board[$sweepY][$sweepX]["blank"]) { // unless it is a blank tile	
							$yCrossAxisWordPoints = $yCrossAxisWordPoints + $boardInfo["letterScores"][strtoupper($board[$sweepY][$sweepX]["letter"])] * (!$board[$sweepY][$sweepX]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$sweepY][$sweepX]]["letter"] : 1);
						}

						// multiply multiplier by word multiplier if not locked
						$yCrossAxisWordMultiplier *= (!$board[$sweepY][$sweepX]["locked"] ? $boardInfo["scoreMultipliers"][$boardInfo["modifiers"][$sweepY][$sweepX]]["word"] : 1);

						($j === 0 ? $sweepX++ : $sweepX--); // increment/decrement based on sweep direction
					}
				}
				
				// compile the y cross axis word and points into the array if it is long enough
				if (strlen($yCrossAxisWord) > 1) {
					$words[$yCrossAxisWord] = $yCrossAxisWordPoints * $yCrossAxisWordMultiplier;
				}
			}

			($i === 0 ? $sweepY++ : $sweepY--); // increment/decrement based on sweep direction
		}
	}

	// compile the y axis word and points into the array if it is long enough
	if (strlen($yAxisWord) > 1) {
		$words[$yAxisWord] = $yAxisWordPoints * $yAxisWordMultiplier;
	}
}

// check word validity
$wordsKeys = array_keys($words);
for ($i=0; $i < count($wordsKeys); $i++) { 
	if (!in_array(strtolower($wordsKeys[$i]), $dictionary["words"])) {
		exit('{"errorLevel":1,"message":"All words must be valid."}');
	}
}

// add the bonus 50 points if user used all letters
if (count($tiles) === 7) {
	$words[""] = 50;
} else if (count($tiles) > 7) { // a small little cheat check
	exit('{"errorLevel":2,"message":"You cannot use more than 7 letters in a single turn."}');
}

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
$pointsSum = array_sum($words);
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
for ($i=0; $i < count($players[$currentPlayerIndex]['bankOrder']); $i++) { 
	if ($players[$currentPlayerIndex]['bankOrder'][$i] >= $bankCount) {
		unset($players[$currentPlayerIndex]['bankOrder'][$i]);

		// disassociate
		$players[$currentPlayerIndex]['bankOrder'] = array_values($players[$currentPlayerIndex]['bankOrder']);
	}
}

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

// upload the new game data
$letterBagJson = json_encode($letterBag);
$boardJson = json_encode($board);
$playersJson = json_encode($players);

$sql = "UPDATE games SET letterBag='$letterBagJson',players='$playersJson',turn='$totalTurn',inactive='$inactive',board='$boardJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

if ($inactive) {
	echo '{"errorLevel":0,"status":1,"message":"Your move has been recorded and the game has ended. Good job!"}';
} else {
	echo '{"errorLevel":0,"status":0,"message":"Your move has been recorded."}';
}

// close the connection
$conn->close();

?>