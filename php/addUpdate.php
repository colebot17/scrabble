<?php

function addUpdate($conn, int $gameId, string $type, array $data) {
    // get the updates list
    $sql = "SELECT updates FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;
    $row = mysqli_fetch_assoc($query);
    $updates = json_decode($row['updates'], true);

    // create the update
    $newUpdate = Array(
        "type" => $type,
        "data" => $data,
        "timestamp" => time()
    );

    // add the update
    $updates[] = $newUpdate;

    // encode and escape the updates list
    $updatesJson = json_encode($updates);
    $updatesJson = str_replace("'", "\'", $updatesJson);
    $updatesJson = str_replace('"', '\"', $updatesJson);

    // re-upload the updates list
    $sql = "UPDATE games SET updates='$updatesJson' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;

    return true;
}