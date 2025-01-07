<?php

require_once(__DIR__ . '/../vendor/autoload.php');
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/../");
$dotenv->load();
if (!array_key_exists('password', $_COOKIE) || $_COOKIE['password'] !== $_ENV["ADMIN_PASSWORD"]) 
    header('Location: validate.php');