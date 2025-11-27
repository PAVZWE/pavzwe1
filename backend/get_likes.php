<?php
header('Content-Type: application/json');
// ... (قم بتكرار كود اتصال قاعدة البيانات PDO من الملف السابق) ...

$video_id = $_GET['video_id'] ?? null;

if (empty($video_id)) {
    echo json_encode(['success' => false, 'message' => 'Missing video ID.']);
    exit;
}

// جلب العدد الكلي للإعجابات بأمان
$sql_count = "SELECT COUNT(*) FROM likes WHERE video_id = ?";
$stmt_count = $pdo->prepare($sql_count);
$stmt_count->execute([$video_id]);
$count = $stmt_count->fetchColumn();

echo json_encode(['success' => true, 'count' => $count]);
?>