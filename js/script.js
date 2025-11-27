document.addEventListener('DOMContentLoaded', () => {
    const likeButton = document.getElementById('likeButton');
    const videoId = document.getElementById('video_id').value; // معرف الفيديو (123)

    likeButton.addEventListener('click', async () => {
        
        // 1. تجهيز البيانات لإرسالها إلى الخادم
        const formData = new FormData();
        formData.append('video_id', videoId);
        
        // 2. إرسال طلب AJAX إلى ملف الخلفية (process_like.php)
        try {
            const response = await fetch('backend/process_like.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // 3. تحديث العداد بناءً على الرد من الخادم
                document.getElementById('likeCount').textContent = data.new_count;
                // تغيير شكل الزر بعد الإعجاب
                likeButton.classList.add('liked'); 
                likeButton.textContent = '✅ أعجبني';
            } else {
                alert('حدث خطأ أو أنك سجلت إعجابك من قبل: ' + data.message);
            }
        } catch (error) {
            console.error('فشل في إرسال طلب الإعجاب:', error);
            alert('فشل في الاتصال بالخادم.');
        }
    });

    // مهمة إضافية: عند تحميل الصفحة، اطلب العدد الحالي للإعجابات
    fetchLikesCount(videoId); 
});

// دالة لجلب عدد الإعجابات الحالي
async function fetchLikesCount(videoId) {
     try {
        const response = await fetch(`backend/get_likes.php?video_id=${videoId}`);
        const data = await response.json();
        if (data.success) {
            document.getElementById('likeCount').textContent = data.count;
        }
    } catch (error) {
        console.error('فشل في جلب عدد الإعجابات:', error);
    }
}
// --- وظائف نظام التعليقات (أضف هذا في نهاية ملف script.js) ---

document.addEventListener('DOMContentLoaded', () => {
    // تأكد من جلب التعليقات عند تحميل الصفحة
    fetchComments('123');
});

const commentForm = document.getElementById('commentForm');
commentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // منع تحديث الصفحة
    
    // جلب البيانات من النموذج
    const videoId = commentForm.querySelector('input[name="video_id"]').value;
    const name = document.getElementById('commenterName').value.trim();
    const text = document.getElementById('commentText').value.trim();
    
    if (!name || !text) {
        alert('الرجاء تعبئة الاسم ونص التعليق.');
        return;
    }
    
    const formData = new FormData();
    formData.append('video_id', videoId);
    formData.append('username', name);
    formData.append('comment_text', text);
    
    // إرسال التعليق عبر AJAX إلى ملف add_comment.php
    try {
        const response = await fetch('backend/add_comment.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('تم إرسال التعليق بنجاح!');
            // مسح حقل نص التعليق بعد الإرسال
            document.getElementById('commentText').value = '';
            // تحديث قائمة التعليقات مباشرة
            fetchComments(videoId);
        } else {
            alert('فشل في إرسال التعليق: ' + data.message);
        }
    } catch (error) {
        console.error('فشل في إرسال طلب التعليق:', error);
    }
});

// دالة لجلب وعرض التعليقات من get_comments.php
async function fetchComments(videoId) {
    try {
        const container = document.getElementById('commentsContainer');
        
        // جلب التعليقات من الخادم
        const response = await fetch(`backend/get_comments.php?video_id=${videoId}`);
        const data = await response.json();
        
        container.innerHTML = ''; // مسح القديم
        
        if (data.success && data.comments.length > 0) {
            data.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                // نستخدم innerHTML هنا لأن الخادم أرسل لنا نصاً "آمِناً" بعد تنقيته
                commentElement.innerHTML = `
                    <p><strong>${comment.username}</strong> <small>(${comment.created_at})</small></p>
                    <p class="comment-body">${comment.comment_text}</p>
                    <hr>
                `;
                container.appendChild(commentElement);
            });
        } else {
            container.innerHTML = '<h3>لا توجد تعليقات بعد. كن أول من يعلق!</h3>';
        }
    } catch (error) {
        console.error('فشل في جلب التعليقات:', error);
    }
}