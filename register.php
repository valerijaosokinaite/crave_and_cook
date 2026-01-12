<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirm_password'];

    // Patikriname, ar visi laukai užpildyti
    if (empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
        die('❗ Užpildykite visus laukus.');
    }

    // Patikriname, ar slaptažodžiai sutampa
    if ($password !== $confirmPassword) {
        die('❗ Slaptažodžiai nesutampa.');
    }

    // Patikriname slaptažodžio saugumą
    if (!preg_match('/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/', $password)) {
        die('❗ Slaptažodis turi būti bent 8 simbolių, su didžiąja, mažąja raide ir skaičiumi.');
    }

    // Patikriname ar el. paštas nenaudojamas
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        die("❗ Šis el. paštas jau registruotas.");
    }

    // Užkoduojame slaptažodį ir įrašome vartotoją
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);

    if ($stmt->execute()) {
        header("Location: index.html"); // arba redirect į prisijungimo sekciją
        exit();
    } else {
        echo "❗ Klaida registruojant: " . $stmt->error;
    }
}
?>
