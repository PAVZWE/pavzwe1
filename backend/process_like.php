<?php
// ابدأ الجلسة لتتمكن من تتبع المستخدم
session_start();
header('Content-Type: application/json');

// تأكد من أن الاتصال بقاعدة البيانات تم إعداده هنا (مثال على PDO)
// يجب عليك استبدال هذه القيم ببيانات اتصالك الحقيقية
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_db_user';
$pass = 'your_db_password';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
     exit;
}

// 1. الحصول على معرف الفيديو ومعرف المستخدم (الجلسة)
$video_id = $_POST['video_id'] ?? null;
// إذا لم يكن هناك معرف جلسة، قم بإنشاء واحد. هذا هو المعرف الذي سنتتبع به الإعجاب.
if (!isset($_SESSION['user_like_id'])) {
    $_SESSION['user_like_id'] = session_id(); 
}
$user_identifier = $_SESSION['user_like_id']; 

if (empty($video_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing video ID.']);
    exit;
}

// 2. التحقق مما إذا كان المستخدم قد سجل إعجاباً بالفعل
$sql_check = "SELECT COUNT(*) FROM likes WHERE video_id = ? AND user_identifier = ?";
$stmt_check = $pdo->prepare($sql_check);
$stmt_check->execute([$video_id, $user_identifier]);
$count = $stmt_check->fetchColumn();

if ($count > 0) {
    // تم الإعجاب مسبقاً
    echo json_encode(['success' => false, 'message' => 'Already liked.']);
    exit;
}

// 3. إضافة الإعجاب بأمان (Prepared Statement)
$sql_insert = "INSERT INTO likes (video_id, user_identifier) VALUES (?, ?)";
$stmt_insert = $pdo->prepare($sql_insert);
$stmt_insert->execute([$video_id, $user_identifier]);

// 4. جلب العدد الكلي للإعجابات للتحديث
$sql_count = "SELECT COUNT(*) FROM likes WHERE video_id = ?";
$stmt_count = $pdo->prepare($sql_count);
$stmt_count->execute([$video_id]);
$new_count = $stmt_count->fetchColumn();

// 5. إرسال الرد إلى JavaScript
echo json_encode(['success' => true, 'new_count' => $new_count]);
?>