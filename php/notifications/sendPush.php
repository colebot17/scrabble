<?php

require_once('./../../vendor/autoload.php');

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

function sendPush($sub) {

    $subscription = Subscription::create($sub);

    $auth = Array(
        "VAPID" => Array(
            "subject" => "mailto: <colebot17@gmail.com>",
            "publicKey" => "BDFxOE30BWtMOXpSGFdcTY5GrhGeI4EZZJG-TOVnK56J5Ehg-UTTevPDsuZ5owHVYYgBV_A8pdHFc-cDrhQWyFU",
            "privateKey" => "JBne33dUaLrXJ21haGbOAU5quqoJsaSsdvs-kfEjlv4"
        )
    );

    $webPush = new WebPush($auth);

    $report = $webPush->sendOneNotification(
        $subscription,
        '{"message":"Hello! 👋"}'
    );

    return $report;
}