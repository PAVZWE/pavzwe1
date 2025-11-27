// محتوى ملف app.js
// المتغير 'db' يمثل قاعدة بيانات Firestore، وهو متاح هنا للاستخدام.

// ==========================================================
// 1. دالة إضافة الإعجاب (اللايك)
// ==========================================================
function addLike(postId) {
  const postRef = db.collection('posts').doc(postId);
  
  // استخدام معاملة (Transaction) لضمان زيادة العدد بشكل آمن
  db.runTransaction(function(transaction) {
    return transaction.get(postRef).then(function(doc) {
      
      // قراءة العدد الحالي أو البدء من 0
      const currentLikes = doc.exists && doc.data().likesCount !== undefined ? doc.data().likesCount : 0;
      const newLikes = currentLikes + 1;
      
      // تحديث العدد الجديد في قاعدة البيانات
      transaction.set(postRef, { likesCount: newLikes }, { merge: true });
      
      // لا نحتاج لتحديث الواجهة يدوياً، onSnapshot ستقوم بذلك.
    });
  }).then(function() {
    console.log("تمت إضافة إعجاب بنجاح!");
  }).catch(function(error) {
    console.error("فشل عملية اللايك:", error);
  });
}


// ==========================================================
// 2. دالة إضافة التعليق
// ==========================================================
function submitComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const commentText = commentInput.value.trim();
  
  if (commentText === "") {
    alert("الرجاء كتابة التعليق أولاً.");
    return;
  }
  
  // حفظ التعليق في مجموعة فرعية 'comments' تابعة للمنشور 'posts/post_123'
  db.collection('posts').doc(postId).collection('comments').add({
      user: "زائر (مصطفى)", // يمكن تغيير هذا لاحقاً لاسم المستخدم
      text: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      commentInput.value = ""; // مسح مربع الإدخال
      console.log("تم نشر التعليق بنجاح!");
    })
    .catch((error) => {
      console.error("فشل نشر التعليق:", error);
    });
}


// ==========================================================
// 3. دالة تحميل وتحديث البيانات تلقائياً (الربط الحي)
// ==========================================================
function loadPostData(postId) {
  
  // أ) الاستماع لعدد اللايكات (Likes Count)
  db.collection('posts').doc(postId)
    .onSnapshot((doc) => {
      const likesCountSpan = document.getElementById(`likes-count-${postId}`);
      if (doc.exists && doc.data().likesCount !== undefined) {
        // تحديث العداد المعروض في HTML
        likesCountSpan.innerText = doc.data().likesCount;
      } else if (!doc.exists) {
        // إذا لم يكن المستند موجوداً، ننشئه باللايكات = 0
        db.collection('posts').doc(postId).set({ likesCount: 0 }, { merge: true });
        likesCountSpan.innerText = 0;
      }
    });
  
  // ب) الاستماع للتعليقات (Comments)
  db.collection('posts').doc(postId).collection('comments')
    .orderBy('timestamp', 'asc')
    .onSnapshot((snapshot) => {
      const commentsArea = document.getElementById(`comments-area-${postId}`);
      commentsArea.innerHTML = ''; // مسح القديم
      
      snapshot.forEach((doc) => {
        const comment = doc.data();
        const p = document.createElement('p');
        p.innerHTML = `<strong>${comment.user}:</strong> ${comment.text}`;
        commentsArea.appendChild(p);
      });
    });
}


// ==========================================================
// تشغيل الدوال عند تحميل الصفحة
// ==========================================================

// عند تحميل الصفحة بالكامل، ابدأ بتحميل بيانات المنشور 'post_123'
window.onload = function() {
  loadPostData('post_123');
};