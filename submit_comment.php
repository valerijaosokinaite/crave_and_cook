<?php
session_start();
header('Content-Type: application/json');
require 'db.php'; // tavo prisijungimo failas

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Turite būti prisijungęs.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$recipe_id = $_POST['recipe_id'] ?? null;
$content = trim($_POST['content'] ?? '');

if (!$recipe_id || empty($content)) {
    echo json_encode(['success' => false, 'message' => 'Komentaras negali būti tuščias.']);
    exit;
}

// Įrašome komentarą
$stmt = $conn->prepare("INSERT INTO comments (user_id, recipe_id, content, created_at) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("iis", $user_id, $recipe_id, $content);

if ($stmt->execute()) {
    // Atnaujiname komentarų skaičių receptų lentelėje
    $update = $conn->prepare("UPDATE recipes SET comments = comments + 1 WHERE id = ?");
    $update->bind_param("i", $recipe_id);
    $update->execute();
    $update->close();

    echo json_encode(['success' => true, 'message' => 'Komentaras išsaugotas.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Klaida saugant komentarą.']);
}

$stmt->close();
$conn->close();
?>
