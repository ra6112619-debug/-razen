// ===== بيانات الكتب =====
const STORAGE_KEY = "razenBooks";

const defaultBooks = [
  {
    name: "مقدمة في البرمجة",
    subject: "برمجة 101",
    author: "د. أحمد محمد",
    specialty: "علوم الحاسب",
    type: "بيع",
    price: 35,
    wanted: "",
    location: "جامعة الملك سعود",
    image: ""
  },
  {
    name: "قواعد البيانات",
    subject: "قواعد بيانات",
    author: "د. خالد علي",
    specialty: "علوم الحاسب",
    type: "مقايضة",
    price: 0,
    wanted: "هياكل البيانات",
    location: "جامعة الملك عبدالعزيز",
    image: ""
  },
  {
    name: "هندسة البرمجيات",
    subject: "هندسة برمجيات",
    author: "د. سارة عبدالله",
    specialty: "هندسة البرمجيات",
    type: "بيع",
    price: 45,
    wanted: "",
    location: "جامعة الإمام",
    image: ""
  }
];

let books = loadBooks();
let currentImage = "";

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) {
    console.log("[v0] تعذر قراءة الكتب المحفوظة:", e.message);
  }
  return [...defaultBooks];
}

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.log("[v0] تعذر حفظ الكتب:", e.message);
  }
}

// ===== أدوات مساعدة =====
function escapeHTML(text) {
  if (text === undefined || text === null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function toggleMenu() {
  document.getElementById("nav")?.classList.toggle("open");
}

// ===== عرض الكتب =====
function getFilteredBooks() {
  const search = (document.getElementById("searchInput")?.value || "")
    .toLowerCase()
    .trim();
  const specialty = document.getElementById("specialtyFilter")?.value || "";
  const type = document.getElementById("tradeFilter")?.value || "";

  return books.filter((book) => {
    const haystack = `${book.name} ${book.author} ${book.subject}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesSpecialty = !specialty || book.specialty === specialty;
    const matchesType = !type || book.type === type;
    return matchesSearch && matchesSpecialty && matchesType;
  });
}

function renderBooks() {
  const container = document.getElementById("booksContainer");
  const emptyMessage = document.getElementById("emptyMessage");
  if (!container) return;

  const filtered = getFilteredBooks();
  container.innerHTML = "";

  if (emptyMessage) emptyMessage.classList.toggle("hidden", filtered.length !== 0);

  filtered.forEach((book) => {
    const index = books.indexOf(book);
    const isSwap = book.type === "مقايضة";

    const cover = book.image
      ? `<div class="book-cover" style="background-image:url('${book.image}')"></div>`
      : `<div class="book-cover">📚</div>`;

    const priceBlock = isSwap
      ? `<div class="book-price">مقايضة</div>
         <p>مطلوب: ${escapeHTML(book.wanted || "غير محدد")}</p>`
      : `<div class="book-price">${escapeHTML(book.price)} ريال</div>`;

    const card = document.createElement("article");
    card.className = "book-card";
    card.innerHTML = `
      ${cover}
      <div class="book-info">
        <span class="book-type ${isSwap ? "swap" : ""}">${escapeHTML(book.type)}</span>
        <h3>${escapeHTML(book.name)}</h3>
        <p>المادة: ${escapeHTML(book.subject)}</p>
        <p>المؤلف: ${escapeHTML(book.author || "غير محدد")}</p>
        <p>التخصص: ${escapeHTML(book.specialty)}</p>
        <p>📍 ${escapeHTML(book.location || "غير محدد")}</p>
        ${priceBlock}
        <button class="btn btn-primary" onclick="requestBook(${index})">
          ${isSwap ? "طلب التبادل 🔄" : "طلب الشراء 🛒"}
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  updateTotal();
}

function updateTotal() {
  const total = document.getElementById("totalBooks");
  if (total) total.textContent = books.length;
}

function filterBooks() {
  renderBooks();
}

function requestBook(index) {
  const book = books[index];
  if (!book) return;
  showToast(
    book.type === "مقايضة"
      ? "تم إرسال طلب التبادل بنجاح ✅"
      : "تم إرسال طلب الشراء بنجاح ✅"
  );
}

// ===== نموذج الإضافة =====
function togglePrice() {
  const type = document.getElementById("bookTrade")?.value;
  const priceField = document.getElementById("priceField");
  const wantedField = document.getElementById("wantedField");
  const isSwap = type === "مقايضة";
  priceField?.classList.toggle("hidden", isSwap);
  wantedField?.classList.toggle("hidden", !isSwap);
}

function previewImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("الرجاء اختيار ملف صورة");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentImage = reader.result;
    const preview = document.getElementById("imagePreview");
    if (preview) {
      preview.innerHTML = `<img src="${currentImage}" alt="معاينة غلاف الكتاب">`;
    }
    document.getElementById("clearImage")?.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  currentImage = "";
  const preview = document.getElementById("imagePreview");
  if (preview) {
    preview.innerHTML =
      '<span class="image-placeholder">📚<br><small>لا توجد صورة بعد</small></span>';
  }
  const input = document.getElementById("bookImage");
  if (input) input.value = "";
  document.getElementById("clearImage")?.classList.add("hidden");
}

function addBook(event) {
  event.preventDefault();

  const type = document.getElementById("bookTrade").value;
  const isSwap = type === "مقايضة";

  const book = {
    name: document.getElementById("bookName").value.trim(),
    subject: document.getElementById("bookSubject").value.trim(),
    author: document.getElementById("bookAuthor").value.trim(),
    specialty: document.getElementById("bookSpecialty").value,
    type,
    price: isSwap ? 0 : Number(document.getElementById("bookPrice").value) || 0,
    wanted: isSwap ? document.getElementById("wantedBook").value.trim() : "",
    location: document.getElementById("bookLocation").value.trim() || "غير محدد",
    image: currentImage
  };

  books.unshift(book);
  saveBooks();
  renderBooks();

  event.target.reset();
  clearImage();
  togglePrice();

  showToast("تمت إضافة الكتاب بنجاح 📚");
  document.getElementById("books")?.scrollIntoView({ behavior: "smooth" });
}

// ===== التهيئة =====
document.addEventListener("DOMContentLoaded", () => {
  renderBooks();
  togglePrice();

  // إغلاق قائمة الجوال عند الضغط على رابط
  document.querySelectorAll("#nav a").forEach((link) => {
    link.addEventListener("click", () =>
      document.getElementById("nav")?.classList.remove("open")
    );
  });
});
