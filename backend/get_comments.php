<?php
// backend/get_comments.php
header('Content-Type: application/json');

// *** تأكد من تعديل هذا الجزء ببيانات اتصالك الحقيقية ***
$host = 'localhost'; $db = 'your_database_name';
$user = 'your_db_user'; $pass = 'your_db_password';
$charset = 'utf8mb4'; $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
try { $pdo = new PDO($dsn, $user, $pass, $options); } catch (\PDOException $e) { /* ... */ }
// ******************************************************

$video_id = $_GET['video_id'] ?? null;
$comments = [];

// جلب التعليقات بأمان (Prepared Statement)
$sql = "SELECT username, comment_text, created_at FROM comments WHERE video_id = ? ORDER BY created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute([$video_id]);
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($results as $row) {
    // ⚠️ الخطوة العبقرية للأمان: Escaping عند الإخراج
    // تحويل الرموز الخطرة (<, >) إلى كيانات HTML لمنع تنفيذها كـكود JavaScript.
    $comments[] = [
        'username' => htmlspecialchars($row['username'], ENT_QUOTES, 'UTF-8'),
        'comment_text' => htmlspecialchars($row['comment_text'], ENT_QUOTES, 'UTF-8'),
        'created_at' => date('Y-m-d H:i', strtotime($row['created_at']))
    ];
}

echo json_encode(['success' => true, 'comments' => $comments]);
?>