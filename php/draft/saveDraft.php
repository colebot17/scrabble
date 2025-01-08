<?php

require(__DIR__ . "/../util/getConn.php");
$conn = getConn();

$user = (int)$_POST['user'];
$pwd = $_POST['pwd'];
$gameId = (int)$_POST['game'];
$tiles = json_decode($_POST['tiles'], true);

require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
    exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// make sure there are actually some tiles
if (!$tiles || count($tiles) === 0) {
    exit('{"errorLevel":1,"message":"You must place at least one tile to store a draft"}');
}

require "draft.php";
$draft = Array();
for ($i = 0; $i < count($tiles); $i++) {
    $draft[] = Array(
        "bankIndex" => $tiles[$i]["bankIndex"],
        "letter" => $tiles[$i]["letter"],
        "pos" => Array(
            $tiles[$i]["x"],
            $tiles[$i]["y"]
        )
    );
}
setDraft($conn, $user, $gameId, $draft);

echo '{"errorLevel":0,"message":"Draft Saved"}';