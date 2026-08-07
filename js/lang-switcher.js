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

  function injectGoogleTranslate() {
    if (document.getElementById('google_translate_element')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.visibility = 'hidden';
    document.body.appendChild(container);

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }
  }

  window.googleTranslateElementInit = function () {

    injectGoogleTranslate();

    new window.google.translate.TranslateElement({
      pageLanguage: 'vi',
      includedLanguages: 'en,ja,zh-CN',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');

    setTimeout(function () {
      const combo = document.querySelector('.goog-te-combo');
      if (combo && window.__pendingGoogleLang) {
        combo.value = window.__pendingGoogleLang;
        combo.dispatchEvent(new Event('change'));
        window.__pendingGoogleLang = null;
      }
    }, 1200);
  };

  function switchGoogleTranslate(lang) {
    const targetLang = lang === ALT_LANG ? 'en' : 'vi';
    const combo = document.querySelector('.goog-te-combo');

    setLanguageButton(targetLang);

    if (combo) {
      combo.value = targetLang;
      combo.dispatchEvent(new Event('change'));
      return true;
    }

    window.__pendingGoogleLang = targetLang;
    injectGoogleTranslate();
    return false;
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

        switchGoogleTranslate(lang);

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
