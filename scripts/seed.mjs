import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyCZMIBxTmvbhvisE2bZljgI7Wer-ji63ZA',
  authDomain: 'jacory-2562c.firebaseapp.com',
  projectId: 'jacory-2562c',
  storageBucket: 'jacory-2562c.firebasestorage.app',
  messagingSenderId: '241900801483',
  appId: '1:241900801483:web:ef5ff9d07183c6c871fa4e',
});

const db = getFirestore(app);

const books = [
  {
    id: 'vision-to-dream',
    title: 'Vision to Dream',
    meta: 'Picture book · Ages 4–8',
    live: true,
    featured: true,
    desc: 'The book that started it all. A tender, joyful story about chasing a dream you can\'t yet see — and discovering that not being able to see it is exactly how every great dream begins.',
    cover: 'Featured cover — Vision to Dream',
    coverImage: 'https://photos.smugmug.com/photos/i-GRFHwHW/0/LdcQbjVhNJJcjzzJsKn2V9hWJrtgnrXLsvXH8bm8S/M/i-GRFHwHW-M.jpg',
    purchaseSections: [
      {
        label: 'Physical',
        icon: '📖',
        links: [
          { name: 'Amazon', href: '#' },
          { name: 'Barnes & Noble', href: '#' },
          { name: 'Bookshop.org', href: '#' },
          { name: 'IndieBound', href: '#' },
        ],
      },
      {
        label: 'Digital',
        icon: '📱',
        links: [
          { name: 'Kindle', href: '#' },
          { name: 'Apple Books', href: '#' },
          { name: 'Google Play Books', href: '#' },
          { name: 'Nook', href: '#' },
        ],
      },
      {
        label: 'Audio',
        icon: '🎧',
        links: [
          { name: 'Audible', href: '#' },
          { name: 'Libro.fm', href: '#' },
          { name: 'Apple Books Audio', href: '#' },
        ],
      },
    ],
  },
  {
    id: 'ballin-beyond-the-wheels',
    title: "Ballin' Beyond the Wheels",
    meta: 'Picture book · Out now',
    live: true,
    featured: false,
    desc: 'A celebration of every kid who was told to sit on the sidelines — and rolled, ran, or swung their way onto the field anyway.',
    cover: "Book cover — Ballin' Beyond the Wheels",
    coverImage: 'https://photos.smugmug.com/photos/i-b6XHhhH/0/M7qWbkQrvH67G4km6XxDVrJJXcZZ9gjnMCmMT6c7x/L/i-b6XHhhH-L.jpg',
    purchaseSections: [],
  },
  {
    id: 'bigger-than-life',
    title: 'Bigger Than Life',
    meta: 'Picture book · Coming soon',
    live: false,
    featured: false,
    desc: 'A new story about how the smallest kid in the room can carry the biggest dream of all.',
    cover: 'Book cover — Bigger Than Life (coming soon)',
    coverImage: '',
    purchaseSections: [],
  },
  {
    id: 'i-cant-see',
    title: "I Can't See, But I'm Still Perfect as Me",
    meta: 'First chapter book · Coming soon',
    live: false,
    featured: false,
    desc: "Jacory's first chapter book — a young reader discovers that being different was never the same as being less.",
    cover: "Book cover — I Can't See, But I'm Still Perfect as Me (coming soon)",
    coverImage: '',
    purchaseSections: [],
  },
];

for (const { id, ...data } of books) {
  await setDoc(doc(db, 'books', id), data);
  console.log(`✓ ${data.title}`);
}

console.log('Seed complete.');
process.exit(0);
