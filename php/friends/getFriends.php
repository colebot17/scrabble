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
        $currentFriend = $friends[$i];
        $sql = "SELECT name, games FROM accounts WHERE id='$currentFriend'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        $friendName = $row['name'];
        $friendGames = json_decode($row['games'], true);

        $sharedGames = array_values(array_intersect($games, $friendGames));

        // only count the games that are active
        $numSharedGames = 0;
        $streak = Array(
            "wins" => 0,
            "ties" => 0,
            "losses" => 0
        );

        for ($j = 0; $j < count($sharedGames); $j++) {
            $currentId = $sharedGames[$j];
            $sql = "SELECT inactive, players FROM games WHERE id='$currentId'";
            $query = mysqli_query($conn, $sql);
            $row = mysqli_fetch_assoc($query);

            // count the total number of active shared games (including group games)
            if ($row['inactive'] == 0) {
                $numSharedGames++;
            }

            // if the game is a 1v1 game
            $players = json_decode($row['players'], true);
            if (count($players) === 2) {
                // count it towards the streak
                if ($players[0]["points"] > $players[1]["points"]) {
                    $streak[(int)$players[0]["id"] == (int)$userId ? "wins" : "losses"]++;
                } else if ($players[1]["points"] > $players[0]["points"]) {
                    $streak[(int)$players[1]["id"] == (int)$userId ? "wins" : "losses"]++;
                } else {
                    $streak["ties"]++;
                }
            }
        }

        $friendsList[] = Array(
            "id" => $friends[$i],
            "name" => $friendName,
            "numSharedGames" => $numSharedGames,
            "streak" => $streak
        );
    }

    return $friendsList;
}

function getRequests($conn, $userId) {
    // get the requests list
    $sql = "SELECT requests FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $requests = json_decode($row['requests'], true);

    $requestsList = Array();
    for ($i = 0; $i < count($requests); $i++) {
        // get the friend's info
        $sql = "SELECT name FROM accounts WHERE id='$requests[$i]'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        $friendName = $row['name'];

        array_push($requestsList, Array(
            "id" => $requests[$i],
            "name" => $friendName
        ));
    }

    return $requestsList;
}

function getSentRequests($conn, $userId) {
    // get the sent requests list
    $sql = "SELECT sentRequests FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $sentRequests = json_decode($row['sentRequests'], true);

    $sentRequestsList = Array();
    for ($i = 0; $i < count($sentRequests); $i++) {
        // get the friend's info
        $sql = "SELECT name FROM accounts WHERE id='$sentRequests[$i]'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        $friendName = $row['name'];

        array_push($sentRequestsList, Array(
            "id" => $sentRequests[$i],
            "name" => $friendName
        ));
    }

    return $sentRequestsList;
}

function getAllLists($conn, $userId) {
    return Array(
        "friendList" => getFriends($conn, $userId),
        "requestList" => getRequests($conn, $userId),
        "sentRequestList" => getSentRequests($conn, $userId)
    );
}