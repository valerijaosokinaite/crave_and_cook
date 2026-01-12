<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Turite būti prisijungęs.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$comment_id = $_POST['comment_id'] ?? null;

if (!$comment_id) {
    echo json_encode(['success' => false, 'message' => 'Nenurodytas komentaro ID.']);
    exit;
}

// Tikrina ar komentaras priklauso naudotojui
$stmt = $conn->prepare("SELECT recipe_id FROM comments WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $comment_id, $user_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Neturite teisės ištrinti šio komentaro.']);
    exit;
}
$stmt->bind_result($recipe_id);
$stmt->fetch();
$stmt->close();

// Ištrina komentarą
$del = $conn->prepare("DELETE FROM comments WHERE id = ?");
$del->bind_param("i", $comment_id);
$del->execute();
$del->close();

// Sumažina skaičių
$upd = $conn->prepare("UPDATE recipes SET comments = comments - 1 WHERE id = ?");
$upd->bind_param("i", $recipe_id);
$upd->execute();
$upd->close();

echo json_encode(['success' => true, 'message' => 'Komentaras ištrintas.']);
?>
