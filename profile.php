<?php
session_start();
include 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Neprisijungta']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Gauti vartotojo duomenis
$stmt = $conn->prepare("SELECT username, email FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$userResult = $stmt->get_result()->fetch_assoc();

// Gauti įkeltų receptų skaičių
$stmt = $conn->prepare("SELECT COUNT(*) AS total FROM recipes WHERE author_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$uploadsResult = $stmt->get_result()->fetch_assoc();

// Gauti mėgstamiausių skaičių
$stmt = $conn->prepare("SELECT COUNT(*) AS favorites FROM favorites WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$fav_result = $stmt->get_result()->fetch_assoc();
$favorites = (int) $fav_result["favorites"];

// Gauti vartotojo įkeltus receptus
$stmt = $conn->prepare("SELECT id, title, description, instructions, portions, time, tips, meal, type, diet, cuisine, img, photos, likes, comments, created_at FROM recipes WHERE author_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$recipesResult = $stmt->get_result();
$recipes = [];
while ($row = $recipesResult->fetch_assoc()) {
    $recipes[] = $row;
}

// Grąžinti JSON
echo json_encode([
    "success" => true,
    "username" => $userResult["username"],
    "email" => $userResult["email"],
    "favorites" => $favorites,
    "uploads" => $uploadsResult["total"],
    "recipes" => $recipes
]);