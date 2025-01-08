<?php

function getConn() : mysqli {
    require_once(__DIR__ . '/../../vendor/autoload.php');
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . "/../../");
    $dotenv->load();

    $servername = $_ENV["DATABASE_HOST"];
    $username = $_ENV["DATABASE_USER"];
    $password = $_ENV["DATABASE_PASSWORD"];
    $dbname = $_ENV["DATABASE_NAME"];

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}