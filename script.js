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

function loadBooks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(defaultBooks)
  );

  return defaultBooks;
}

function saveBooks(books) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(books)
  );
}

let books = loadBooks();

function addBook(book) {
  books.push(book);
  saveBooks(books);
}

function deleteBook(index) {
  books.splice(index, 1);
  saveBooks(books);
}

function searchBooks(text) {
  const search = text.toLowerCase().trim();

  return books.filter(book =>
    book.name.toLowerCase().includes(search) ||
    book.subject.toLowerCase().includes(search) ||
    book.author.toLowerCase().includes(search)
  );
}

function filterBooks(type) {
  if (type === "الكل") {
    return books;
  }

  return books.filter(book => book.type === type);
}

console.log("Razen يعمل بنجاح");
console.log("عدد الكتب:", books.length);
