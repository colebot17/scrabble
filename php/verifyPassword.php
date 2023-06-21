<?php

function verifyPassword($conn, int $userId, string $pwd) {
    // check password
    $sql = "SELECT pwd FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false; // make sure the user exists
    $row = mysqli_fetch_assoc($query);
    return password_verify($pwd, $row['pwd']);
}

?>