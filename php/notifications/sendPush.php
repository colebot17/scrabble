<?php

require_once('./../../vendor/autoload.php');

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

function sendPush($sub) {

    $subscription = Subscription::create($sub);

    // $auth = Array(
    //     "VAPID" => Array(
    //         "subject" => "mailto: <colebot17@gmail.com>",
    //         "publicKey" => "BDFxOE30BWtMOXpSGFdcTY5GrhGeI4EZZJG-TOVnK56J5Ehg-UTTevPDsuZ5owHVYYgBV_A8pdHFc-cDrhQWyFU",
    //         "privateKey" => "JBne33dUaLrXJ21haGbOAU5quqoJsaSsdvs-kfEjlv4"
    //     )
    // );

    $auth = Array(
        "VAPID" => Array(
            "subject" => "mailto: <colebot17@gmail.com>",
            "publicKey" => "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAExGdM+I45xPZYDrCa5hW7B37PqZ3PufvbPEYRd0arAuo/3Er0dwzR3y6QdqZaTiN1zFn1tLIV73Azf0QSjPWoMw==",
            "privateKey" => "MHcCAQEEIGDT6XhzkztiAzoT6+uyguNi7ejpHaSwS88LexCUj/+loAoGCCqGSM49AwEHoUQDQgAExGdM+I45xPZYDrCa5hW7B37PqZ3PufvbPEYRd0arAuo/3Er0dwzR3y6QdqZaTiN1zFn1tLIV73Azf0QSjPWoMw=="
        )
    );

    $webPush = new WebPush($auth);

    $report = $webPush->sendOneNotification(
        $subscription,
        '{"message":"Hello! 👋"}'
    );

    return $report;
}