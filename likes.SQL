CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    user_identifier VARCHAR(255) NOT NULL, -- لتخزين Session ID أو IP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- لمنع تسجيل الإعجاب المكرر لنفس الفيديو ونفس المعرّف
    UNIQUE KEY unique_like (video_id, user_identifier)
);