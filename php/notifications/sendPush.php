<?php

require_once(__DIR__ . '/../../vendor/autoload.php');

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

function sendPush($sub, $messageObj) {

    $subscription = Subscription::create($sub);

    // $messageObj = Array(
    //     "title" => $title,
    //     "text" => $text,
    //     "data" => Array(
    //         "game" => 649
    //     )
    // );

    require_once(__DIR__ . '/../../vendor/autoload.php');
    $dotenv = Dotenv\Dotenv::createImmutable("/home/hfcyju9l2xme/scrabble.colebot.com/");
    $dotenv->load();

    $auth = Array(
        "VAPID" => Array(
            "subject" => "https://scrabble.colebot.com",
            "publicKey" => "BDFxOE30BWtMOXpSGFdcTY5GrhGeI4EZZJG-TOVnK56J5Ehg-UTTevPDsuZ5owHVYYgBV_A8pdHFc-cDrhQWyFU",
            "privateKey" => $ENV["VAPID_PRIVATE_KEY"]
        )
    );

    $webPush = new WebPush($auth);

    $report = $webPush->sendOneNotification(
        $subscription,
        json_encode($messageObj)
    );

    return $report;
}