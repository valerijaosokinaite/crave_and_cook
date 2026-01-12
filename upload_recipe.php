<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Netinkamas užklausos metodas']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Reikia būti prisijungus']);
    exit;
}

// Gauti duomenis
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$instructions = trim($_POST['instructions'] ?? '');
$portions = (int) ($_POST['portions'] ?? 0);
$time = trim($_POST['time'] ?? '');
$tips = trim($_POST['tips'] ?? '');

$meal = trim($_POST['meal_custom'] ?? '') ?: trim($_POST['meal'] ?? '');
$type = trim($_POST['type_custom'] ?? '') ?: trim($_POST['type'] ?? '');
$diet = trim($_POST['diet_custom'] ?? '') ?: trim($_POST['diet'] ?? '');
$cuisine = trim($_POST['cuisine_custom'] ?? '') ?: trim($_POST['cuisine'] ?? '');

$author_id = $_SESSION['user_id'];
$created_at = date('Y-m-d H:i:s');
$likes = 0;
$comments = 0;

// Ingredientai
$ingredient_names = $_POST['ingredient_name'] ?? [];
$ingredient_amounts = $_POST['ingredient_amount'] ?? [];
$ingredient_units = $_POST['ingredient_unit'] ?? [];

if (count($ingredient_names) !== count($ingredient_amounts) || count($ingredient_names) !== count($ingredient_units)) {
    echo json_encode(['success' => false, 'message' => 'Neteisingas ingredientų skaičius']);
    exit;
}

// Konvertuojame į JSON
$names_json = json_encode($ingredient_names, JSON_UNESCAPED_UNICODE);
$amounts_json = json_encode($ingredient_amounts, JSON_UNESCAPED_UNICODE);
$units_json = json_encode($ingredient_units, JSON_UNESCAPED_UNICODE);

// Nuotraukos
$img = '';
$photoArray = [];

$baseURL = "https://itech024.vaidila.vdu.lt/";
$uploadDir = 'uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!empty($_FILES['image-upload']['name'][0])) {
    foreach ($_FILES['image-upload']['tmp_name'] as $index => $tmpName) {
        $filename = time() . '_' . basename($_FILES['image-upload']['name'][$index]);
        $targetPath = $uploadDir . $filename;
        if (move_uploaded_file($tmpName, $targetPath)) {
            if (!$img) $img = $baseURL . $targetPath;
            $photoArray[] = $baseURL . $targetPath;
        }
    }
}

if (!$title || !$description || !$instructions || !$portions || !$time) {
    echo json_encode(['success' => false, 'message' => 'Visi privalomi laukai turi būti užpildyti']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO recipes 
        (title, description, instructions, portions, time, tips, meal, type, diet, cuisine, img, photos, likes, comments, author_id, created_at, ingredient_names, ingredient_amounts, ingredient_units)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $photosJson = json_encode($photoArray, JSON_UNESCAPED_UNICODE);

    $stmt->bind_param("sssissssssssiiisss", 
        $title, $description, $instructions, $portions, $time, $tips, 
        $meal, $type, $diet, $cuisine, $img, $photosJson, 
        $likes, $comments, $author_id, $created_at,
        $names_json, $amounts_json, $units_json
    );

    $stmt->execute();

    $newUploadsStmt = $conn->prepare("SELECT COUNT(*) AS total FROM recipes WHERE author_id = ?");
    $newUploadsStmt->bind_param("i", $author_id);
    $newUploadsStmt->execute();
    $newUploadsResult = $newUploadsStmt->get_result()->fetch_assoc();
    
    echo json_encode([
      'success' => true,
      'message' => 'Receptas įkeltas sėkmingai',
      'new_uploads' => $newUploadsResult['total']
    ]);
    
    $stmt->close();
    $conn->close();
}
