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
        $numGames = 0;
        for ($j = 0; $j < count($sharedGames); $j++) {
            $currentId = $sharedGames[$j];
            $sql = "SELECT inactive FROM games WHERE id='$currentId'";
            $query = mysqli_query($conn, $sql);
            $row = mysqli_fetch_assoc($query);
            if ($row['inactive'] == 0) {
                $numGames++;
            }
        }

        $friendsList[] = Array(
            "id" => $friends[$i],
            "name" => $friendName,
            "numGames" => $numGames
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

?>