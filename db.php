<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$server = "localhost";
$user = "itech024";
$password = "A6D*dFcf2VtZ";
$database = "itech024";

$conn = new mysqli($server, $user, $password, $database);

if ($conn->connect_error) {
    die("Nepavyko prisijungti: " . $conn->connect_error);
}
?>
