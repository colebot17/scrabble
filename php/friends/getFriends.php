<?php

function getFriends($conn, $userId) {
    // get the friends list
    $sql = "SELECT friends, games FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $friends = json_decode($row['friends'], true);
    $games = json_decode($row['games'], true);

    $friendsList = Array();
    for ($i = 0; $i < count($friends); $i++) {
        // get the friend's info
        $sql = "SELECT name, games FROM accounts WHERE id='$friends[$i]'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        $friendName = $row['name'];
        $friendGames = json_decode($row['games'], true);

        $sharedGames = array_intersect($games, $friendGames);

        array_push($friendsList, Array(
            "id" => $friends[$i],
            "name" => $friendName,
            "numGames" => count($sharedGames)
        ));
    }

    return $friendsList;
}

?>