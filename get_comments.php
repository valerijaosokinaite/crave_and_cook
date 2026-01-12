<?php
require 'db.php';
header('Content-Type: application/json');

$recipe_id = $_GET['recipe_id'] ?? null;

if (!$recipe_id) {
    echo json_encode(['success' => false, 'message' => 'Trūksta recepto ID']);
    exit;
}

$stmt = $conn->prepare("SELECT c.id, c.content, c.created_at, c.user_id, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.recipe_id = ? ORDER BY c.created_at DESC");
$stmt->bind_param("i", $recipe_id);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

echo json_encode(['success' => true, 'comments' => $comments]);
?>
