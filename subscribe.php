<?php
require 'db.php';
header('Content-Type: application/json');

$email = trim($_POST['email'] ?? '');

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'El. paštas negali būti tuščias.']);
    exit;
}

// Tikriname ar jau yra toks el. paštas
$stmt = $conn->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Šis el. paštas jau užregistruotas.']);
    $stmt->close();
    exit;
}
$stmt->close();

// Įrašome naują
$insert = $conn->prepare("INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())");
$insert->bind_param("s", $email);
if ($insert->execute()) {
    echo json_encode(['success' => true, 'message' => 'Sėkmingai užsiprenumeruota!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Nepavyko įrašyti el. pašto.']);
}
$insert->close();
?>
