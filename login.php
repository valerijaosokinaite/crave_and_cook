<?php
ob_start();

session_start();
header('Content-Type: application/json');
require 'db.php';

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        echo json_encode(["success" => false, "message" => "Blogas užklausos metodas"]);
        ob_end_flush();
        exit;
    }

    $email = trim($_POST["email"] ?? '');
    $password = $_POST["password"] ?? '';

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Tušti laukai"]);
        ob_end_flush();
        exit;
    }

    // NAUJAS – su 'username'
    $stmt = $conn->prepare("SELECT id, username, email, password FROM users WHERE email = ?");
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "SQL klaida: " . $conn->error]);
        ob_end_flush();
        exit;
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            $_SESSION["user_id"] = $user["id"];
            $_SESSION["username"] = $user["username"];
            $_SESSION["email"] = $user["email"];

            echo json_encode(["success" => true, "username" => $user["username"]]);
        } else {
            echo json_encode(["success" => false, "message" => "Neteisingas slaptažodis"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Toks el. paštas nerastas"]);
    }

    $stmt->close();
    $conn->close();
} catch (Throwable $e) {
    echo json_encode(["success" => false, "message" => "Kritinė klaida: " . $e->getMessage()]);
}

ob_end_flush();
exit;
?>
