// js/lang-switcher.js
// Giữ nguyên UI/animation cờ cũ, dùng GTranslate (flags.js) làm engine dịch phía sau.
// Dựa trên API chính thức window.doGTranslate mà GTranslate tự expose ra global scope.
(function () {
  const DEFAULT_LANG = 'vi';
  const ALT_LANG = 'en';

  function setLanguageButton(lang) {
    const btnFlag = document.getElementById('lang-btn-flag');
    const btn = document.getElementById('lang-btn');
    if (!btnFlag || !btn) return;

    if (lang === ALT_LANG) {
      btnFlag.src = '/images/flag-en.svg';
      btnFlag.alt = 'English';
      btn.setAttribute('title', 'English');
    } else {
      btnFlag.src = '/images/flag-vi.svg';
      btnFlag.alt = 'Tiếng Việt';
      btn.setAttribute('title', 'Tiếng Việt');
    }
  }

  // Đọc ngôn ngữ hiện tại từ cookie googtrans, giống hệt cách flags.js tự đọc.
  // Dùng để: 1) hiển thị đúng icon lúc trang load, 2) không bị "icon reset" khi qua trang khác.
  function getCurrentLangFromCookie() {
    const match = document.cookie.match('(^|;) ?googtrans=([^;]*)(;|$)');
    if (!match) return null;
    const parts = match[2].split('/');
    return parts[2] || null; // dạng /vi/en -> lấy "en"
  }

  // GTranslate chỉ tải thư viện dịch thật (Google Translate lib) khi có sự kiện
  // focusin/pointerenter xảy ra trên link do chính nó tạo ra bên trong .gtranslate_wrapper.
  // Nút cờ của mình nằm ngoài wrapper đó nên phải tự bắn sự kiện này trước.
  function ensureTranslateLibLoaded() {
    const gtLink = document.querySelector('.gtranslate_wrapper a[data-gt-lang]');
    if (gtLink) {
      gtLink.dispatchEvent(new Event('focusin', { bubbles: true }));
    }
  }

  function switchLanguage(lang) {
    const targetLang = lang === ALT_LANG ? 'en' : 'vi';
    setLanguageButton(targetLang);

    ensureTranslateLibLoaded();

    // doGTranslate tự có cơ chế retry nếu thư viện Google Translate chưa load xong,
    // nên gọi thẳng luôn, không cần tự setTimeout/MutationObserver như trước.
    if (typeof window.doGTranslate === 'function') {
      window.doGTranslate(DEFAULT_LANG + '|' + targetLang);
    } else {
      // Trường hợp hiếm: script GTranslate chưa kịp chạy xong (mạng rất chậm).
      // Thử lại sau 300ms một lần.
      setTimeout(function () {
        if (typeof window.doGTranslate === 'function') {
          window.doGTranslate(DEFAULT_LANG + '|' + targetLang);
        } else {
          console.error('window.doGTranslate không tồn tại. Kiểm tra script flags.js đã load chưa.');
        }
      }, 300);
    }
  }

  function init() {
    const btn = document.getElementById('lang-btn');
    const menu = document.querySelector('.lang-menu');
    const items = document.querySelectorAll('.lang-item');
    const sel = document.getElementById('lang-select');
    if (!btn || !menu) return;

    // Đồng bộ icon với ngôn ngữ thực tế đang lưu trong cookie (fix vụ "icon reset khi qua trang khác")
    const savedLang = getCurrentLangFromCookie();
    const initialLang = (savedLang === ALT_LANG) ? ALT_LANG : DEFAULT_LANG;
    setLanguageButton(initialLang);
    if (sel) {
      sel.value = initialLang;
    }

    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      menu.style.display = expanded ? 'none' : 'block';
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
        menu.style.display = 'none';
      }
    });

    items.forEach(function (item) {
      item.addEventListener('click', function () {
        const lang = item.getAttribute('data-lang');
        if (!lang) return;
        switchLanguage(lang);
        btn.setAttribute('aria-expanded', 'false');
        menu.style.display = 'none';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();