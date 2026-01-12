<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

try {
    // Įtraukiame ingredientų laukus iš receptų lentelės
    $stmt = $conn->prepare("
        SELECT r.id, r.title, r.description, r.instructions, r.portions, r.time,
               r.tips, r.meal, r.type, r.diet, r.cuisine, r.img, r.photos,
               r.likes, r.comments, r.created_at, u.username AS author,
               r.ingredient_names, r.ingredient_amounts, r.ingredient_units
        FROM recipes r
        JOIN users u ON r.author_id = u.id
        ORDER BY r.created_at DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $recipes = [];

    while ($row = $result->fetch_assoc()) {
        // Ingredientai – jei tušti, gražina tuščią masyvą
        $ingredients = array_map(
            function ($name, $amount, $unit) {
                return "$name – $amount $unit";
            },
            json_decode($row["ingredient_names"] ?? '[]', true),
            json_decode($row["ingredient_amounts"] ?? '[]', true),
            json_decode($row["ingredient_units"] ?? '[]', true)
        );

        $recipes[] = [
            "id" => $row["id"],
            "title" => $row["title"],
            "description" => $row["description"],
            "instructions" => explode("\n", trim($row["instructions"])), // suskaidyti žingsnius
            "portions" => $row["portions"],
            "time" => $row["time"],
            "tips" => $row["tips"],
            "meal" => $row["meal"],
            "type" => $row["type"],
            "diet" => $row["diet"],
            "cuisine" => $row["cuisine"],
            "img" => $row["img"] ?: "images/placeholder.jpg", // fallback jei nėra pagr. nuotraukos
            "photos" => $row["photos"] ? json_decode($row["photos"], true) : [$row["img"] ?: "images/placeholder.jpg"],
            "likes" => (int) $row["likes"],
            "comments" => (int) $row["comments"],
            "author" => $row["author"],
            "date" => $row["created_at"],
            "ingredients" => $ingredients
        ];
    }

    echo json_encode(["success" => true, "recipes" => $recipes], JSON_UNESCAPED_UNICODE);

    $stmt->close();
    $conn->close();
} catch (Throwable $e) {
    echo json_encode(["success" => false, "message" => "Klaida: " . $e->getMessage()]);
}
