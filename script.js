// =========================
// بيانات الكتب
// =========================

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
    wanted: "كتاب برمجة",
    location: "جامعة الملك عبدالعزيز",
    image: ""
  },
  {
    name: "هياكل البيانات",
    subject: "هياكل بيانات",
    author: "د. نورة محمد",
    specialty: "علوم الحاسب",
    type: "بيع",
    price: 30,
    wanted: "",
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

// =========================
// تحميل الكتب
// =========================

function loadBooks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBooks));
    return defaultBooks;
  } catch (error) {
    console.error("حدث خطأ أثناء تحميل الكتب:", error);
    return defaultBooks;
  }
}

// =========================
// حفظ الكتب
// =========================

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// =========================
// المتغيرات
// =========================

let books = loadBooks();
let currentImage = "";

// =========================
// إضافة كتاب
// =========================

function addBook(book) {
  books.push(book);
  saveBooks(books);
}

// =========================
// حذف كتاب
// =========================

function deleteBook(index) {
  if (index >= 0 && index < books.length) {
    books.splice(index, 1);
    saveBooks(books);
  }
}

// =========================
// البحث عن الكتب
// =========================

function searchBooks(text) {
  const searchText = text.trim().toLowerCase();

  if (!searchText) {
    return books;
  }

  return books.filter(book =>
    book.name.toLowerCase().includes(searchText) ||
    book.subject.toLowerCase().includes(searchText) ||
    book.author.toLowerCase().includes(searchText) ||
    book.specialty.toLowerCase().includes(searchText) ||
    book.location.toLowerCase().includes(searchText)
  );
}

// =========================
// تصفية الكتب حسب النوع
// =========================

function filterBooks(type) {
  if (!type || type === "الكل") {
    return books;
  }

  return books.filter(book => book.type === type);
}

// =========================
// تصدير البيانات
// =========================

function exportBooks() {
  const data = JSON.stringify(books, null, 2);
  const blob = new Blob([data], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "razen-books.json";
  link.click();

  URL.revokeObjectURL(url);
}

// =========================
// استيراد البيانات
// =========================

function importBooks(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const importedBooks = JSON.parse(event.target.result);

      if (Array.isArray(importedBooks)) {
        books = importedBooks;
        saveBooks(books);
        location.reload();
      }
    } catch (error) {
      alert("ملف الكتب غير صالح.");
    }
  };

  reader.readAsText(file);
}

// =========================
// عرض عدد الكتب
// =========================

function getBooksCount() {
  return books.length;
}

// =========================
// تشغيل المشروع
// =========================

console.log("Razen يعمل بنجاح");
console.log("عدد الكتب:", getBooksCount());
