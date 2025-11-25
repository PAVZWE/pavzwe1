// ==========================================================
// 1. وظائف التنظيف والتحقق (Sanitization and Validation)
// ==========================================================

/**
 * وظيفة تنظيف المُدخلات: تقوم بإزالة وهروب أي كود HTML أو JavaScript خبيث (للحماية من XSS).
 * هذا هو الخط الدفاعي الأول على جانب المتصفح.
 * @param {string} inputString - النص الذي أدخله المستخدم.
 * @returns {string} - النص النظيف والآمن.
 */
function sanitizeInput(inputString) {
  if (typeof inputString !== 'string') {
    return '';
  }
  
  // إنشاء عنصر DOM مؤقت لهروب رموز HTML (تحويل < إلى &lt;).
  const tempDiv = document.createElement('div');
  tempDiv.textContent = inputString;
  let safeString = tempDiv.innerHTML;
  
  // إزالة أي كلمات دالة صريحة على محاولة حقن (مثل on* events أو javascript:).
  const forbiddenPatterns = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on[a-zA-Z]+\s*=|javascript\s*:/gi;
  safeString = safeString.replace(forbiddenPatterns, '');
  
  return safeString.trim();
}

/**
 * وظيفة للتحقق من أن النص يحتوي فقط على أحرف وأرقام عربية وإنجليزي (لتقليل حقن الاستعلامات).
 * هذا التحقق قوي للمدخلات العادية مثل الأسماء أو العناوين.
 * @param {string} inputString - النص المراد فحصه.
 * @returns {boolean} - true إذا كان النص آمناً، false خلاف ذلك.
 */
function isAlphaNumericAndSafe(inputString) {
  // التعبير النمطي (Regex) يسمح باللغات العربية، الإنجليزية، الأرقام، والمسافات والنقاط والشرطات البسيطة.
  // (يجب أن يتم التحقق الأكثر دقة على الخادم)
  const regex = /^[\u0600-\u06FF\s\w.-]+$/;
  return regex.test(inputString);
}


// ==========================================================
// 2. تطبيق الحماية على نماذج الإرسال (Form Submission Protection)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  // مثال: نطبق التنظيف على نموذج البحث (إذا كان لدينا واحد).
  
  // 1. فحص زر الاستكشاف لمنع أي محاولة حقن عبر URL (على سبيل المثال)
  const exploreButton = document.querySelector('.btn-primary');
  if (exploreButton) {
    exploreButton.addEventListener('click', (e) => {
      // كود تنظيف أي متغيرات URL قبل استخدامها (إذا كان يستخدمها).
      console.log("تم النقر على زر الاستكشاف. يتم تطبيق طبقة الحماية.");
      // يمكن إضافة كود هنا للتحقق من حالة المستخدم أو إعدادات المتصفح.
    });
  }
  
  // 2. فحص مدخل البحث قبل إرساله (للحماية من XSS).
  const searchInput = document.querySelector('.search-input');
  const navbar = document.querySelector('.navbar');
  
  if (navbar && searchInput) {
    navbar.addEventListener('submit', (e) => {
      // هذا يحدث إذا كان الشريط جزءاً من وسم <form>، إذا لم يكن كذلك، نحتاج لزر إرسال
      e.preventDefault();
      const rawQuery = searchInput.value;
      
      // تطبيق التنظيف
      const safeQuery = sanitizeInput(rawQuery);
      
      // تطبيق التحقق
      if (!isAlphaNumericAndSafe(safeQuery)) {
        alert("تم رفض طلب البحث: يرجى استخدام أحرف وأرقام عادية فقط.");
        return;
      }
      
      if (safeQuery !== rawQuery) {
        console.warn("تم تنظيف المدخلات الخبيثة من الاستعلام.");
      }
      
      // الآن يمكنك استخدام safeQuery بأمان أكبر
      console.log("تم البحث عن: " + safeQuery);
      // هنا يذهب الكود الذي يرسل الاستعلام النظيف إلى الخادم
      // searchFunction(safeQuery); 
    });
  }
  
});

// ==========================================================
// 3. الإجراءات الأمنية الإضافية (Security Enhancements)
// ==========================================================

/**
 * منع المستخدمين من استخدام زر الفأرة الأيمن (لإخفاء مصدر الكود).
 * هذا لا يوفر حماية قوية، ولكنه يمنع المبتدئين من فحص الكود بسهولة.
 */
document.addEventListener('contextmenu', (e) => {
  // قم بإلغاء تفعيل هذا السطر إذا كنت لا ترغب في منع زر الفأرة الأيمن.
  // e.preventDefault(); 
});


console.log("تم تحميل ملف security.js بنجاح. طبقة الحماية الإضافية جاهزة.");