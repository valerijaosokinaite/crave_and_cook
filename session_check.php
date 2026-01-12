<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION["user_id"], $_SESSION["username"], $_SESSION["email"])) {
    echo json_encode([
        "loggedIn" => true,
        "user_id" => $_SESSION["user_id"],       // ← BŪTINA trynimui
        "username" => $_SESSION["username"],
        "email" => $_SESSION["email"]
    ]);
} else {
    echo json_encode(["loggedIn" => false]);
}
exit;
?>
