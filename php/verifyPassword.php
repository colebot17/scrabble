<?php

function verifyPassword($conn, int $userId, string $pwd, bool $allowTemp = true) {
    // check password
    $sql = "SELECT pwd FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false; // make sure the user exists
    $row = mysqli_fetch_assoc($query);

    if ($pwd === "" && $allowTemp) return true; // always allow access if account has no password

    return password_verify($pwd, $row['pwd']); // otherwise use password hashing
}