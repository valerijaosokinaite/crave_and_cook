<?php
session_start();
require_once "db.php";

if (!isset($_SESSION['user_id'])) {
  echo json_encode(["success" => false, "message" => "Norint išsaugoti receptą, reikia prisijungti!"]);
  exit;
}

$user_id = $_SESSION['user_id'];

$query = "
  SELECT r.*
  FROM favorites f
  JOIN recipes r ON f.recipe_id = r.id
  WHERE f.user_id = ?
  ORDER BY f.added_at DESC
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$recipes = [];

while ($row = $result->fetch_assoc()) {
  $recipes[] = $row;
}

echo json_encode(["success" => true, "recipes" => $recipes]);
?>
