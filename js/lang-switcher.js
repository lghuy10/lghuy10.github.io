(function () {
  const DEFAULT_LANG = 'vi';
  const ALT_LANG = 'en';
 
  let gtSelect = null;       // cache <select> do GTranslate tạo ra
  let pendingLang = null;    // ngôn ngữ đang chờ áp dụng nếu select chưa sẵn sàng
 
  function setLanguageButton(lang) {
    const btnFlag = document.getElementById('lang-btn-flag');
    const btn = document.getElementById('lang-btn');
    if (!btnFlag || !btn) return;
 
    if (lang === ALT_LANG) {
      btnFlag.src = 'images/flag-en.svg';
      btnFlag.alt = 'English';
      btn.setAttribute('title', 'English');
    } else {
      btnFlag.src = 'images/flag-vi.svg';
      btnFlag.alt = 'Tiếng Việt';
      btn.setAttribute('title', 'Tiếng Việt');
    }
  }
 
  // Tìm <select> mà GTranslate sinh ra bên trong .gtranslate_wrapper.
  // Dùng MutationObserver thay vì setTimeout cố định để không bị race condition
  // như code Google Translate cũ (bấm sớm quá, script Google chưa kịp tạo combo).
  function waitForGtSelect(callback) {
    const wrapper = document.querySelector('.gtranslate_wrapper');
    if (!wrapper) {
      console.error('Không tìm thấy .gtranslate_wrapper trong DOM');
      return;
    }
 
    const existing = wrapper.querySelector('select');
    if (existing) {
      callback(existing);
      return;
    }
 
    const observer = new MutationObserver(function () {
      const select = wrapper.querySelector('select');
      if (select) {
        observer.disconnect();
        callback(select);
      }
    });
 
    observer.observe(wrapper, { childList: true, subtree: true });
 
    // Phòng trường hợp script GTranslate load lỗi / bị chặn (ad-block, mạng chậm...)
    // -> báo lỗi rõ ràng thay vì im lặng không làm gì, để dễ debug hơn code cũ.
    setTimeout(function () {
      if (!wrapper.querySelector('select')) {
        observer.disconnect();
        console.error(
          'GTranslate widget không khởi tạo được sau 8s. ' +
          'Kiểm tra: 1) script flags.js có load được không (tab Network), ' +
          '2) domain đã được cấu hình đúng trong dashboard GTranslate chưa, ' +
          '3) có bị ad-blocker chặn cdn.gtranslate.net không.'
        );
      }
    }, 8000);
  }
 
  function switchLanguage(lang) {
    const targetLang = lang === ALT_LANG ? 'en' : 'vi';
    setLanguageButton(targetLang);
 
    if (gtSelect) {
      applyLang(gtSelect, targetLang);
      return;
    }
 
    pendingLang = targetLang;
    waitForGtSelect(function (select) {
      gtSelect = select;
      if (pendingLang) {
        applyLang(gtSelect, pendingLang);
        pendingLang = null;
      }
    });
  }
 
  function applyLang(select, targetLang) {
    select.value = targetLang;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
 
  function init() {
    const btn = document.getElementById('lang-btn');
    const menu = document.querySelector('.lang-menu');
    const items = document.querySelectorAll('.lang-item');
    const sel = document.getElementById('lang-select');
    if (!btn || !menu) return;
 
    setLanguageButton(DEFAULT_LANG);
    if (sel) {
      sel.value = DEFAULT_LANG;
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