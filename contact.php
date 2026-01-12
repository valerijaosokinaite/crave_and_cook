<?php
require 'db.php';
header('Content-Type: application/json');

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Prašome užpildyti visus privalomus laukus.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message, sent_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $name, $email, $subject, $message);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Jūsų žinutė sėkmingai išsiųsta!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Klaida siunčiant žinutę.']);
}
$stmt->close();
?>