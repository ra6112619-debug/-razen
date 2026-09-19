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
   تشغيل المشروع
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    books = loadBooks();

    renderBooks();

    togglePrice();

    console.log("رَزين يعمل بنجاح 📚");
    console.log("عدد الكتب:", books.length);
  }
);
