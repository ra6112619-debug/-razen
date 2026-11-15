const STORAGE_KEY = "razenBooks";

const defaultBooks = [
  {
    name: "مقدمة في البرمجة",
    subject: "101 برمجة",
    author: "د. أحمد محمد",
    specialty: "علوم الحاسب",
    type: "بيع",
    price: 35,
    wanted: "",
    location: "جامعة الملك سعود"
  },
  {
    name: "قواعد البيانات",
    subject: "قواعد بيانات",
    author: "د. خالد علي",
    specialty: "علوم الحاسب",
    type: "مقايضة",
    price: 0,
    wanted: "كتاب برمجة",
    location: "جامعة الملك عبدالعزيز"
  },
  {
    name: "هياكل البيانات",
    subject: "هياكل بيانات",
    author: "د. نورة محمد",
    specialty: "علوم الحاسب",
    type: "بيع",
    price: 30,
    wanted: "",
    location: "جامعة الملك عبدالعزيز"
  },
  {
    name: "هندسة البرمجيات",
    subject: "هندسة برمجيات",
    author: "د. سارة عبدالله",
    specialty: "هندسة البرمجيات",
    type: "بيع",
    price: 45,
    wanted: "",
    location: "جامعة الإمام"
  }
];

let books = [];
let qrScanner = null;

function loadBooks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.log("تعذر قراءة الكتب المحفوظة");
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(defaultBooks)
  );

  return [...defaultBooks];
}

function saveBooks() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(books)
  );
}

/* =========================
   عرض الكتب
========================= */

function renderBooks(list = books) {
  const container = document.getElementById("booksContainer");
  const emptyMessage = document.getElementById("emptyMessage");
  const totalBooks = document.getElementById("totalBooks");

  if (!container) return;

  container.innerHTML = "";

  if (totalBooks) {
    totalBooks.textContent = books.length;
  }

  if (list.length === 0) {
    emptyMessage?.classList.remove("hidden");
    return;
  }

  emptyMessage?.classList.add("hidden");

  list.forEach((book, index) => {
    const card = document.createElement("div");
    card.className = "book-card";

    const tradeText =
      book.type === "مقايضة"
        ? "🔄 مقايضة"
        : "💰 بيع";

    const priceText =
      book.type === "بيع"
        ? `${book.price || 0} ريال`
        : `مطلوب: ${book.wanted || "كتاب آخر"}`;

    card.innerHTML = `
      <div class="book-cover">
        📚
      </div>

      <div class="book-info">
        <span class="book-type">
          ${tradeText}
        </span>

        <h3>${escapeHtml(book.name)}</h3>

        <p>
          📘 ${escapeHtml(book.subject)}
        </p>

        <p>
          ✍️ ${escapeHtml(book.author || "غير محدد")}
        </p>

        <p>
          🎓 ${escapeHtml(book.specialty)}
        </p>

        <p>
          📍 ${escapeHtml(book.location || "غير محدد")}
        </p>

        <div class="book-bottom">
          <strong>${escapeHtml(priceText)}</strong>

          <button
            class="delete-btn"
            onclick="deleteBook(${index})"
          >
            حذف
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* =========================
   البحث والفلاتر
========================= */

function filterBooks() {
  const searchInput = document.getElementById("searchInput");
  const specialtyFilter =
    document.getElementById("specialtyFilter");
  const tradeFilter =
    document.getElementById("tradeFilter");

  const search = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const specialty = specialtyFilter
    ? specialtyFilter.value
    : "";

  const trade = tradeFilter
    ? tradeFilter.value
    : "";

  const filtered = books.filter(book => {

    const matchesSearch =
      !search ||
      book.name.toLowerCase().includes(search) ||
      book.subject.toLowerCase().includes(search) ||
      (book.author || "").toLowerCase().includes(search);

    const matchesSpecialty =
      !specialty ||
      book.specialty === specialty;

    const matchesTrade =
      !trade ||
      book.type === trade;

    return (
      matchesSearch &&
      matchesSpecialty &&
      matchesTrade
    );
  });

  renderBooks(filtered);
}

/* =========================
   إضافة كتاب
========================= */

function addBook(event) {
  event.preventDefault();

  const name =
    document.getElementById("bookName").value.trim();

  const subject =
    document.getElementById("bookSubject").value.trim();

  const author =
    document.getElementById("bookAuthor").value.trim();

  const specialty =
    document.getElementById("bookSpecialty").value;

  const type =
    document.getElementById("bookTrade").value;

  const price =
    Number(document.getElementById("bookPrice").value) || 0;

  const wanted =
    document.getElementById("wantedBook").value.trim();

  const location =
    document.getElementById("bookLocation").value.trim();

  if (!name || !subject || !specialty) {
    showToast("يرجى تعبئة البيانات المطلوبة");
    return;
  }

  if (type === "بيع" && price <= 0) {
    showToast("أدخلي سعر الكتاب");
    return;
  }

  if (type === "مقايضة" && !wanted) {
    showToast("اكتبي الكتاب المطلوب للمقايضة");
    return;
  }

  const newBook = {
    name,
    subject,
    author,
    specialty,
    type,
    price: type === "بيع" ? price : 0,
    wanted: type === "مقايضة" ? wanted : "",
    location: location || "غير محدد"
  };

  books.unshift(newBook);

  saveBooks();

  event.target.reset();

  togglePrice();

  renderBooks();

  showToast("تم نشر الكتاب بنجاح 📚");

  document
    .getElementById("books")
    ?.scrollIntoView({
      behavior: "smooth"
    });
}

/* =========================
   حذف كتاب
========================= */

function deleteBook(index) {
  if (!confirm("هل تريدين حذف هذا الكتاب؟")) {
    return;
  }

  books.splice(index, 1);

  saveBooks();

  filterBooks();

  showToast("تم حذف الكتاب");
}

/* =========================
   إظهار السعر / المقايضة
========================= */

function togglePrice() {
  const trade =
    document.getElementById("bookTrade");

  const priceInput =
    document.getElementById("bookPrice");

  const wantedInput =
    document.getElementById("wantedBook");

  if (!trade) return;

  const priceLabel =
    priceInput?.closest("label");

  const wantedLabel =
    wantedInput?.closest("label");

  if (trade.value === "بيع") {

    if (priceLabel) {
      priceLabel.style.display = "flex";
    }

    if (wantedLabel) {
      wantedLabel.style.display = "none";
    }

    if (wantedInput) {
      wantedInput.value = "";
    }

  } else {

    if (priceLabel) {
      priceLabel.style.display = "none";
    }

    if (wantedLabel) {
      wantedLabel.style.display = "flex";
    }

    if (priceInput) {
      priceInput.value = "";
    }
  }
}

/* =========================
   الموقع
========================= */

function getLocation() {
  const message =
    document.getElementById("locationMessage");

  if (!navigator.geolocation) {
    if (message) {
      message.textContent =
        "المتصفح لا يدعم تحديد الموقع.";
    }
    return;
  }

  if (message) {
    message.textContent =
      "📍 جاري تحديد موقعك...";
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {

      if (message) {
        message.textContent =
          "📍 تم تحديد موقعك. يمكنك إضافة موقع الجامعة عند نشر الكتاب.";
      }

      showToast("تم تحديد الموقع بنجاح 📍");
    },

    function() {

      if (message) {
        message.textContent =
          "تعذر تحديد الموقع. يمكنك كتابة الجامعة يدويًا.";
      }

      showToast("اكتبي موقع الجامعة يدويًا");
    }
  );
}

/* =========================
   القائمة للجوال
========================= */

function toggleMenu() {
  const nav = document.getElementById("nav");

  if (nav) {
    nav.classList.toggle("open");
  }
}

/* =========================
   QR
========================= */

function startQR() {
  const reader = document.getElementById("qr-reader");

  if (!reader) return;

  reader.classList.remove("hidden");

  if (typeof Html5Qrcode === "undefined") {
    showToast("ميزة QR لم تجهز بعد، يمكنك إدخال البيانات يدويًا");
    return;
  }

  if (qrScanner) {
    return;
  }

  qrScanner = new Html5Qrcode("qr-reader");

  qrScanner
    .start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      function(decodedText) {

        const bookName =
          document.getElementById("bookName");

        if (bookName) {
          bookName.value = decodedText;
        }

        showToast("تمت قراءة رمز QR 📷");

        stopQR();
      },
      function() {
        // تجاهل محاولات القراءة غير الناجحة
      }
    )
    .catch(function() {
      showToast("تعذر تشغيل الكاميرا");
      stopQR();
    });
}

function stopQR() {
  if (!qrScanner) return;

  qrScanner
    .stop()
    .then(function() {
      qrScanner.clear();
      qrScanner = null;
    })
    .catch(function() {
      qrScanner = null;
    });

  document
    .getElementById("qr-reader")
    ?.classList.add("hidden");
}

/* =========================
   التنبيهات
========================= */

function showToast(message) {
  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function() {
    toast.classList.remove("show");
  }, 2500);
}

/* =========================
   حماية النصوص
========================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}



/* =========================
   حسابات المستخدمين (نسخة تجريبية محلية)
   الحسابات تحفظ في المتصفح فقط وليست مصادقة آمنة.
========================= */
const USERS_STORAGE_KEY = "razenUsers";
const USER_SESSION_KEY = "razenUserSession";
let userAuthMode = "login";

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_SESSION_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function showRoleChoice() {
  document.querySelectorAll("main > section").forEach(section => section.classList.add("hidden"));
  document.getElementById("roleChoice")?.classList.remove("hidden");
  document.getElementById("siteNavbar")?.classList.add("hidden");
  document.getElementById("nav")?.classList.remove("open");
  history.replaceState(null, "", "#welcome");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMarketplace() {
  document.getElementById("roleChoice")?.classList.add("hidden");
  document.getElementById("userAccount")?.classList.add("hidden");
  document.getElementById("admin")?.classList.add("hidden");
  document.querySelectorAll("main > section").forEach(section => {
    if (section.id !== "roleChoice" && section.id !== "userAccount" && section.id !== "admin") section.classList.remove("hidden");
  });
  document.getElementById("siteNavbar")?.classList.remove("hidden");
  history.replaceState(null, "", "#home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openUserAuth(event) {
  if (event) event.preventDefault();
  const panel = document.getElementById("userAccount");
  if (!panel) return;

  panel.classList.remove("hidden");
  document.getElementById("roleChoice")?.classList.add("hidden");
  document.getElementById("siteNavbar")?.classList.add("hidden");
  document.querySelectorAll("main > section").forEach(section => {
    if (section.id !== "userAccount") section.classList.add("hidden");
  });

  const currentUser = getCurrentUser();
  document.getElementById("userAuthPanel")?.classList.toggle("hidden", !!currentUser);
  document.getElementById("userDashboard")?.classList.toggle("hidden", !currentUser);

  if (currentUser) {
    const welcome = document.getElementById("userWelcomeName");
    if (welcome) welcome.textContent = currentUser.name || currentUser.username;
  } else {
    setUserAuthMode("login");
  }

  history.replaceState(null, "", "#userAccount");
  document.getElementById("nav")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setUserAuthMode(mode) {
  userAuthMode = mode;
  const loginForm = document.getElementById("userLoginForm");
  const registerForm = document.getElementById("userRegisterForm");
  const title = document.getElementById("userAuthTitle");
  const switchText = document.getElementById("userSwitchText");
  const switchButton = document.getElementById("userSwitchButton");

  loginForm?.classList.toggle("hidden", mode !== "login");
  registerForm?.classList.toggle("hidden", mode !== "register");

  if (title) title.textContent = mode === "login" ? "تسجيل دخول المستخدم" : "إنشاء حساب جديد";
  if (switchText) switchText.textContent = mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟";
  if (switchButton) switchButton.textContent = mode === "login" ? "إنشاء حساب جديد" : "تسجيل الدخول";

  document.getElementById("userLoginError")?.classList.add("hidden");
  document.getElementById("userRegisterError")?.classList.add("hidden");
}

function toggleUserAuthMode() {
  setUserAuthMode(userAuthMode === "login" ? "register" : "login");
}

function registerUser(event) {
  event.preventDefault();

  const name = document.getElementById("userFullName")?.value.trim() || "";
  const username = document.getElementById("userRegisterUsername")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("userRegisterPassword")?.value || "";
  const confirmPassword = document.getElementById("userConfirmPassword")?.value || "";
  const error = document.getElementById("userRegisterError");

  const showError = message => {
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  };

  if (name.length < 2) return showError("اكتبي اسمًا صحيحًا.");
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return showError("اسم المستخدم يجب أن يكون 3 أحرف أو أكثر، وبالإنجليزية أو الأرقام.");
  }
  if (password.length < 6) return showError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
  if (password !== confirmPassword) return showError("كلمتا المرور غير متطابقتين.");

  const users = getUsers();
  if (users.some(user => user.username === username)) {
    return showError("اسم المستخدم مستخدم بالفعل، اختاري اسمًا آخر.");
  }

  const newUser = { name, username, password };
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ name, username }));

  document.getElementById("userRegisterForm")?.reset();
  showMarketplace();
  showToast("تم إنشاء حسابك بنجاح 🎉");
}

function loginUser(event) {
  event.preventDefault();

  const username = document.getElementById("userLoginUsername")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("userLoginPassword")?.value || "";
  const error = document.getElementById("userLoginError");
  const user = getUsers().find(item => item.username === username && item.password === password);

  if (!user) {
    error?.classList.remove("hidden");
    return;
  }

  error?.classList.add("hidden");
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify({ name: user.name, username: user.username }));
  document.getElementById("userLoginForm")?.reset();
  showMarketplace();
  showToast("تم تسجيل الدخول بنجاح");
}

function logoutUser() {
  sessionStorage.removeItem(USER_SESSION_KEY);
  document.getElementById("userDashboard")?.classList.add("hidden");
  document.getElementById("userAuthPanel")?.classList.remove("hidden");
  setUserAuthMode("login");
  showToast("تم تسجيل الخروج");
}

function closeUserAuth() {
  document.getElementById("userAccount")?.classList.add("hidden");
  showRoleChoice();
}

function goToAddBook() {
  if (!getCurrentUser()) {
    openUserAuth();
    return;
  }
  showMarketplace();
  document.getElementById("add")?.scrollIntoView({ behavior: "smooth" });
}

/* =========================
   تسجيل دخول ولوحة المدير
   دخول تجريبي للعرض الأكاديمي فقط؛ لا يُعد مصادقة آمنة.
========================= */
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Razen@2026";
const ADMIN_SESSION_KEY = "razenAdminSession";

function openAdmin(event) {
  if (event) event.preventDefault();
  const panel = document.getElementById("admin");
  if (!panel) return;
  panel.classList.remove("hidden");
  document.getElementById("roleChoice")?.classList.add("hidden");
  document.getElementById("siteNavbar")?.classList.add("hidden");
  document.querySelectorAll("main > section").forEach(section => {
    if (section.id !== "admin") section.classList.add("hidden");
  });
  const loggedIn = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  document.getElementById("adminLogin")?.classList.toggle("hidden", loggedIn);
  document.getElementById("adminDashboard")?.classList.toggle("hidden", !loggedIn);
  if (loggedIn) renderAdmin();
  history.replaceState(null, "", "#admin");
  document.getElementById("nav")?.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function loginAdmin(event) {
  event.preventDefault();
  const username = document.getElementById("adminUsername")?.value.trim();
  const password = document.getElementById("adminPassword")?.value;
  const error = document.getElementById("adminLoginError");
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    error?.classList.add("hidden");
    document.getElementById("adminLogin")?.classList.add("hidden");
    document.getElementById("adminDashboard")?.classList.remove("hidden");
    document.getElementById("adminLoginForm")?.reset();
    renderAdmin();
    showToast("تم تسجيل الدخول بنجاح");
  } else {
    error?.classList.remove("hidden");
    const passwordInput = document.getElementById("adminPassword");
    if (passwordInput) passwordInput.value = "";
  }
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  document.getElementById("adminDashboard")?.classList.add("hidden");
  document.getElementById("adminLogin")?.classList.remove("hidden");
  showToast("تم تسجيل الخروج");
}

function closeAdmin() {
  document.getElementById("admin")?.classList.add("hidden");
  showRoleChoice();
}

function renderAdmin() {
  const total = document.getElementById("adminTotal");
  const sales = document.getElementById("adminSales");
  const trades = document.getElementById("adminTrades");
  const list = document.getElementById("adminBooks");
  if (!list) return;
  if (total) total.textContent = books.length;
  if (sales) sales.textContent = books.filter(b => b.type === "بيع").length;
  if (trades) trades.textContent = books.filter(b => b.type === "مقايضة").length;
  list.innerHTML = "";
  if (!books.length) {
    list.innerHTML = '<p class="muted">لا توجد كتب منشورة حاليًا.</p>';
    return;
  }
  books.forEach((book, index) => {
    const item = document.createElement("div");
    item.className = "admin-book-row";
    item.innerHTML = `<div><strong>${escapeHtml(book.name)}</strong><small>${escapeHtml(book.subject || "")} · ${escapeHtml(book.location || "غير محدد")} · ${escapeHtml(book.type || "بيع")}</small></div><button class="delete-btn" type="button" onclick="adminDeleteBook(${index})">حذف</button>`;
    list.appendChild(item);
  });
}

function adminDeleteBook(index) {
  if (!confirm("هل تريدين حذف هذا الكتاب نهائيًا من الكتب المحفوظة على هذا الجهاز؟")) return;
  books.splice(index, 1);
  saveBooks();
  renderBooks();
  renderAdmin();
  showToast("تم حذف الكتاب");
}

/* =========================
   تشغيل المشروع
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    books = loadBooks();

    renderBooks();
    showRoleChoice();

    togglePrice();

    console.log("رَزين يعمل بنجاح 📚");
    console.log("عدد الكتب:", books.length);
  }
);
