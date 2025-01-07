<?php
require_once(__DIR__ . '/../vendor/autoload.php');
$dotenv = Dotenv\Dotenv::createImmutable("/home/hfcyju9l2xme/scrabble.colebot.com/");
$dotenv->load();
print_r($_ENV);
