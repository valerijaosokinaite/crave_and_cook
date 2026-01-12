<?php
session_start();
require_once "db.php"; // jei turi DB jungimo failą

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Neprisijungęs naudotojas"]);
  exit;
}

$user_id = $_SESSION['user_id'];
$recipe_id = $_POST['recipe_id'] ?? null;

if (!$recipe_id) {
  echo json_encode(["success" => false, "message" => "Recepto ID negautas"]);
  exit;
}

// Patikrinam ar jau yra
$stmt = $conn->prepare("SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?");
$stmt->bind_param("ii", $user_id, $recipe_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "Jau įtraukta"]);
  exit;
}

// Įrašom
$stmt = $conn->prepare("INSERT INTO favorites (user_id, recipe_id, added_at) VALUES (?, ?, NOW())");
$stmt->bind_param("ii", $user_id, $recipe_id);

if ($stmt->execute()) {
  // Tik jei įrašymas sėkmingas – padidinam likes
  $stmt2 = $conn->prepare("UPDATE recipes SET likes = likes + 1 WHERE id = ?");
  $stmt2->bind_param("i", $recipe_id);
  $stmt2->execute();

  echo json_encode(["success" => true, "message" => "Receptas įtrauktas į mėgstamiausius!"]);
} else {
  echo json_encode(["success" => false, "message" => "Nepavyko įtraukti"]);
}
