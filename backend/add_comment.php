<?php
// backend/add_comment.php
header('Content-Type: application/json');

// *** تأكد من تعديل هذا الجزء ببيانات اتصالك الحقيقية ***
$host = 'localhost'; $db = 'your_database_name';
$user = 'your_db_user'; $pass = 'your_db_password';
$charset = 'utf8mb4'; $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
try { $pdo = new PDO($dsn, $user, $pass, $options); } catch (\PDOException $e) { /* ... */ }
// ******************************************************

$video_id = $_POST['video_id'] ?? null;
$username = $_POST['username'] ?? null;
$comment_text = $_POST['comment_text'] ?? null;

if (empty($video_id) || empty($username) || empty($comment_text)) {
    echo json_encode(['success' => false, 'message' => 'جميع الحقول مطلوبة.']);
    exit;
}

// 1. التنقية المبدئية: إزالة أي وسم HTML ضار من الاسم والتعليق قبل الحفظ (أمان)
$safe_username = strip_tags($username); 
$safe_comment_text = strip_tags($comment_text); 

// 2. إدراج التعليق بأمان باستخدام العبارات المُجهَّزة (Prepared Statements)
try {
    $sql = "INSERT INTO comments (video_id, username, comment_text) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$video_id, $safe_username, $safe_comment_text]);

    echo json_encode(['success' => true, 'message' => 'Comment added.']);
} catch (\PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}
?>