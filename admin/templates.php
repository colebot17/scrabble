<?php
function playerLine($id, &$nameCache, $conn) {
    $name = "";
    if (array_key_exists($id, $nameCache)) {
        $name = $nameCache[$id];
    } else {
        $sql = "SELECT name FROM accounts WHERE id='$id'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        if (!$row) return false;

        $name = $row['name'];
        $nameCache[$id] = $name;
    }

    return $name . ' <span style="color:gray">#' . $id . '</span> <a href="playerLookup.php?playerName=' . $name . '">Info</a>';
}