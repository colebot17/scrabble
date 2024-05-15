<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

function sendEmail($to, $subject, $body, $html = true) {
    $pid = pcntl_fork();

    if ($pid === -1) {
        exit("Could not fork process");
    } else if ($pid) {
        // this is the parent process
    } else {
        // this is the child process
        $mail = new PHPMailer(true);

        try {
            //Server settings
            $mail->SMTPDebug = SMTP::DEBUG_OFF;                         //Make sure there is no debug output
            $mail->isSMTP();                                            //Send using SMTP
            $mail->Host       = 'mail.colebot.com';                     //Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
            $mail->Username   = 'colebot@colebot.com';                  //SMTP username
            $mail->Password   = 'Colebot@96819822';                     //SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
            $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
            $mail->addCustomHeader('X-Entity-Ref-ID', random_bytes(12));//Ensure separate conversations in gmail
        
            //Recipients
            $mail->setFrom('scrabble@colebot.com', 'Scrabble - Colebot.com');
            $mail->addAddress($to); //Add the recipient
            $mail->addReplyTo('colebot@colebot.com', 'Colebot');
            //$mail->addCC('cc@example.com');
            //$mail->addBCC('bcc@example.com');
        
            //Attachments
            //$mail->addAttachment('/var/tmp/file.tar.gz');         //Add attachments
            //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    //Optional name
        
            //Content
            $mail->isHTML($html);                                  //Set email format to HTML
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AltBody = $body;
        
            $mail->send();
            exit(json_encode(Array("errorLevel" => 0, "message" => "Email Sent")));
        } catch (Exception $e) {
            exit(json_encode(Array("errorLevel" => 2, "message" => "There was an error sending the email: " . $mail->ErrorInfo)));
        }
    }
}