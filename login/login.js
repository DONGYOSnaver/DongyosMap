/* ===== 로그인 창 / 로그인 상태 관리 ===== */
(function () {
  // 허용 계정 목록
  var VALID_ACCOUNTS = [
    { email: "hello@dongyos.com", pw: "hello@1234" },
    { email: "dongyo@dongyos.com", pw: "hello@1234" }
  ];

  // login.html 경로 (index.html 기준)
  var LOGIN_HTML_PATH = "login/login.html";

  // 로그인 상태 저장 키 (localStorage)
  var AUTH_KEY = "dongyos_user";

  var overlay, modal, form, emailEl, pwEl, errEl;
  var lastFocus = null;
  var ready = false;

  /* ---------- 로그인 상태 관리 ---------- */
  function getUser() {
    try {
      return localStorage.getItem(AUTH_KEY);
    } catch (e) {
      return null;
    }
  }

  function setUser(email) {
    try {
      localStorage.setItem(AUTH_KEY, email);
    } catch (e) {}
  }

  function clearUser() {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  // 로그인 상태를 화면에 반영
  function renderAuthLink() {
    var user = getUser();

    var link = document.getElementById("authLink");
    if (link) link.textContent = user ? "로그아웃" : "로그인";

    document.body.classList.toggle("logged-in", !!user);

    document.dispatchEvent(new CustomEvent("authchange", { detail: { user: user } }));
  }

  function logout() {
    clearUser();
    renderAuthLink();
  }

  /* ---------- 로그인 창 열기 / 닫기 ---------- */
  function openLogin() {
    if (!ready) return;
    lastFocus = document.activeElement;
    modal.classList.remove("done");
    errEl.textContent = "";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      emailEl.focus();
    }, 100);
  }

  function closeLogin() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  function init() {
    overlay = document.getElementById("loginOverlay");
    modal = document.getElementById("loginModal");
    form = document.getElementById("loginForm");
    emailEl = document.getElementById("loginEmail");
    pwEl = document.getElementById("loginPw");
    errEl = document.getElementById("loginError");
    ready = true;

    document.getElementById("loginClose").addEventListener("click", closeLogin);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLogin();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeLogin();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = emailEl.value.trim();
      var pw = pwEl.value;

      var isValid = VALID_ACCOUNTS.some(function (acc) {
        return acc.email === email && acc.pw === pw;
      });

      if (isValid) {
        errEl.textContent = "";
        setUser(email);
        renderAuthLink();
        document.getElementById("loginWelcome").textContent =
          email.split("@")[0] + "님, 환영합니다!";
        modal.classList.add("done");
        setTimeout(function () {
          closeLogin();
          form.reset();
        }, 1600);
      } else {
        errEl.textContent = "회원가입을 하십시오.";
        pwEl.value = "";
        emailEl.focus();
      }
    });
  }

  // 로그인 열기 / 로그아웃 버튼 이벤트 처리
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-open-login");
    if (!btn) return;
    e.preventDefault();

    if (btn.id === "authLink" && getUser()) {
      logout();
      return;
    }
    openLogin();
  });

  // 페이지 로드 시 상태 반영
  renderAuthLink();

  // login/login.html 불러와서 body 끝에 동적 삽입
  fetch(LOGIN_HTML_PATH)
    .then(function (res) {
      if (!res.ok) throw new Error(LOGIN_HTML_PATH + " 을(를) 불러오지 못했습니다. (" + res.status + ")");
      return res.text();
    })
    .then(function (html) {
      document.body.insertAdjacentHTML("beforeend", html);
      init();
    })
    .catch(function (err) {
      console.error(err);
    });
})();