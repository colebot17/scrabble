<?php

function setDraft($conn, $user, $gameId, $draft) {
    $user = (int)$user;
    $gameId = (int)$gameId;

    $sql = "SELECT players FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);

    for ($i = 0; $i < count($players); $i++) {
        if ((int)$players[$i]["id"] === (int)$user) {
            if ($draft === null) {
                unset($players[$i]["draft"]);
            } else {
                $players[$i]["draft"] = $draft;
            }
            break;
        }
    }

    $playersJson = json_encode($players);
    $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
}

function getDraft($conn, $user, $gameId) {
    $user = (int)$user;
    $gameId = (int)$gameId;

    $sql = "SELECT players, board FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);
    $board = json_decode($row['board'], true);

    $pIndex = false;
    $draft = false;
    for ($i = 0; $i < count($players); $i++) {
        if ((int)$players[$i]["id"] === (int)$user) {
            $pIndex = $i;
            if (array_key_exists('draft', $players[$i])) {
                $draft = $players[$i]["draft"];
            }
            break;
        }
    }
    if ($pIndex === false) exit('{"errorLevel":2,"message":"User not found (searching for draft)"}');
    if ($draft === false) return;

    // check the validity of the draft
    for ($i = 0; $i < count($draft); $i++) {
        $draftLetter = $draft[$i];

        // check the validity of many, many things
        if (
            !array_key_exists('bankIndex', $draftLetter)
            || !array_key_exists('pos', $draftLetter)
            || count($draftLetter["pos"]) !== 2
            || $draftLetter["pos"][0] < 0
            || $draftLetter["pos"][0] > 14
            || $draftLetter["pos"][1] < 0
            || $draftLetter["pos"][1] > 14
        ) {
            setDraft($conn, $user, $gameId, null);
            return;
        }

        // ensure that the letter (if provided) matches the bank index
        if (array_key_exists('letter', $draftLetter)) {
            if ($players[$pIndex]["letterBank"][$draftLetter["bankIndex"]] !== $draftLetter["letter"]) {
                setDraft($conn, $user, $gameId, null);
                return;
            }
        }

        // check that the tile isn't already present on the board
        if ($board[$draftLetter["pos"][1]][$draftLetter["pos"][0]] !== null) {
            setDraft($conn, $user, $gameId, null);
            return;
        }

        // if we got through all that, we should be good (for this letter at least)
    }

    // return the draft
    return $draft;
}