<?php

/**
 * Ensures the user's password is correct, and exits with an error if not
 * (or returns true/false depending on $exit)
 */
function verifyPassword($conn, int $userId, string $pwd, bool $allowTemp = true, bool $exit = true) {
    // check password
    $sql = "SELECT pwd FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) exit(json_encode(["errorLevel" => "2", "message" => "Account not found."])); // make sure the user exists
    $row = mysqli_fetch_assoc($query);

    if ($pwd === "") {
        if (!$allowTemp) {
            if ($exit) exit(json_encode(["errorLevel" => "2", "message" => "You cannot perform this action from this account."]));
            return false;
        }
    } else if (!password_verify($pwd, $row['pwd'])) {
        if ($exit) exit(json_encode(["errorLevel" => "2", "message" => "Invalid session."]));
        return false;
    }

    return true;
}