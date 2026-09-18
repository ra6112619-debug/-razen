let books = JSON.parse(localStorage.getItem("razenBooks")) || [
  {
    name: "مقدمة في البرمجة",
    author: "د. أحمد محمد",
    subject: "برمجة",
    specialty: "علوم الحاسب",
    price: 35,
    type: "بيع",
    location: "الرياض",
    distance: 2
  },
  {
    name: "قواعد البيانات",
    author: "د. خالد علي",
    subject: "قواعد بيانات",
    specialty: "علوم الحاسب",
    price: 40,
    type: "تبادل",
    location: "الرياض",
    distance: 4
  },
  {
    name: "هندسة البرمجيات",
    author: "د. سارة",
    subject: "هندسة برمجيات",
    specialty: "هندسة البرمجيات",
    price: 30,
    type: "بيع",
    location: "الرياض",
    distance: 6
  }
];

const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");
const specialtyFilter = document.getElementById("specialtyFilter");
const typeFilter = document.getElementById("typeFilter");
const addBookForm = document.getElementById("addBookForm");

function saveBooks() {
  localStorage.setItem("razenBooks", JSON.stringify(books));
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function renderBooks() {
  if (!booksContainer) return;

  const search = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const specialty = specialtyFilter
    ? specialtyFilter.value
    : "";

  const type = typeFilter
    ? typeFilter.value
    : "";

  const filteredBooks = books.filter(book => {

    const matchesSearch =
      book.name.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search) ||
      book.subject.toLowerCase().includes(search);

    const matchesSpecialty =
      !specialty || book.specialty === specialty;

    const matchesType =
      !type || book.type === type;

    return matchesSearch && matchesSpecialty && matchesType;
  });

  booksContainer.innerHTML = "";

  if (filteredBooks.length === 0) {
    booksContainer.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;">
        <h3>لا توجد كتب مطابقة 🔍</h3>
        <p style="color:#777;">جربي البحث عن كتاب آخر.</p>
      </div>
    `;
    return;
  }

  filteredBooks.forEach((book, index) => {

    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
      <div class="book-cover">📚</div>

      <div class="book-info">

        <span class="book-type">
          ${book.type}
        </span>

        <h3>${escapeHTML(book.name)}</h3>

        <p>
          المؤلف: ${escapeHTML(book.author)}
        </p>

        <p>
          التخصص: ${escapeHTML(book.specialty)}
        </p>

        <p>
          الموقع: ${escapeHTML(book.location)}
        </p>

        <p>
          📍 يبعد تقريبًا ${book.distance || 0} كم
        </p>

        <div class="book-price">
          ${book.type === "تبادل"
            ? "تبادل كتاب"
            : book.price + " ريال"}
        </div>

        <button
          class="btn btn-primary"
          onclick="requestBook(${index})">
          ${book.type === "تبادل"
            ? "طلب التبادل"
            : "طلب الكتاب"}
        </button>

      </div>
    `;

    booksContainer.appendChild(card);
  });
}

function escapeHTML(text) {
  if (!text) return "";

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requestBook(index) {
  showToast("تم إرسال طلبك بنجاح ✅");
}

if (searchInput) {
  searchInput.addEventListener("input", renderBooks);
}

if (specialtyFilter) {
  specialtyFilter.addEventListener("change", renderBooks);
}

if (typeFilter) {
  typeFilter.addEventListener("change", renderBooks);
}

if (addBookForm) {

  addBookForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const formData = new FormData(addBookForm);

    const book = {
      name: formData.get("bookName"),
      author: formData.get("author"),
      subject: formData.get("subject"),
      specialty: formData.get("specialty"),
      price: Number(formData.get("price")) || 0,
      type: formData.get("type"),
      location: formData.get("location") || "غير محدد",
      distance: 0
    };

    books.unshift(book);

    saveBooks();
    renderBooks();

    addBookForm.reset();

    showToast("تمت إضافة الكتاب بنجاح 📚");

    document
      .getElementById("books")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  });
}

function getLocation() {

  if (!navigator.geolocation) {
    showToast("المتصفح لا يدعم تحديد الموقع");
    return;
  }

  showToast("جاري تحديد موقعك... 📍");

  navigator.geolocation.getCurrentPosition(

    position => {

      showToast("تم تحديد موقعك بنجاح 📍");

      console.log(
        "Latitude:",
        position.coords.latitude
      );

      console.log(
        "Longitude:",
        position.coords.longitude
      );
    },

    () => {
      showToast("تعذر الوصول إلى موقعك");
    }
  );
}

function startQRScanner() {

  const reader = document.getElementById("reader");

  if (!reader) return;

  if (typeof Html5Qrcode === "undefined") {
    showToast("ماسح QR غير متوفر حاليًا");
    return;
  }

  const scanner = new Html5Qrcode("reader");

  scanner.start(

    { facingMode: "environment" },

    {
      fps: 10,
      qrbox: 250
    },

    decodedText => {

      showToast("تمت قراءة QR بنجاح ✅");

      try {

        const data = JSON.parse(decodedText);

        if (data.name) {
          const input =
            document.querySelector(
              '[name="bookName"]'
            );

          if (input) {
            input.value = data.name;
          }
        }

      } catch {

        const input =
          document.querySelector(
            '[name="bookName"]'
          );

        if (input) {
          input.value = decodedText;
        }
      }

      scanner.stop();

    },

    errorMessage => {
      console.log(errorMessage);
    }

  ).catch(error => {

    console.log(error);
    showToast("تعذر تشغيل الكاميرا");

  });
}

document.addEventListener("DOMContentLoaded", () => {

  renderBooks();

  const locationButton =
    document.getElementById("locationButton");

  if (locationButton) {
    locationButton.addEventListener(
      "click",
      getLocation
    );
  }

  const qrButton =
    document.getElementById("qrButton");

  if (qrButton) {
    qrButton.addEventListener(
      "click",
      startQRScanner
    );
  }

});
