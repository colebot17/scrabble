<?php

require_once(__DIR__ . '/../../vendor/autoload.php');

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

function sendPush($sub, $title, $text) {

    $subscription = Subscription::create($sub);

    $messageObj = Array(
        "title" => $title,
        "text" => $text,
        "game" => 649
    );

    $auth = Array(
        "VAPID" => Array(
            "subject" => "https://scrabble.colebot.com",
            "publicKey" => "BDFxOE30BWtMOXpSGFdcTY5GrhGeI4EZZJG-TOVnK56J5Ehg-UTTevPDsuZ5owHVYYgBV_A8pdHFc-cDrhQWyFU",
            "privateKey" => "JBne33dUaLrXJ21haGbOAU5quqoJsaSsdvs-kfEjlv4"
        )
    );

    $webPush = new WebPush($auth);

    $report = $webPush->sendOneNotification(
        $subscription,
        json_encode($messageObj)
    );

    return $report;
}