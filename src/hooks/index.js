import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReveals() {
  useEffect(() => {
    if (prefersReduced()) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

export function trackBookClick(bookTitle, sectionLabel, linkName) {
  if (auth.currentUser) return;
  addDoc(collection(db, 'book_clicks'), {
    book: bookTitle,
    section: sectionLabel,
    retailer: linkName,
    ts: serverTimestamp(),
  }).catch(() => {});
}

export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/manage')) return;
    if (auth.currentUser) return;
    let sid = sessionStorage.getItem('_sid');
    if (!sid) {
      sid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('_sid', sid);
    }
    addDoc(collection(db, 'page_views'), {
      path: location.pathname,
      ts: serverTimestamp(),
      sessionId: sid,
      ref: document.referrer || '',
      w: window.innerWidth,
    }).catch(() => {});
  }, [location.pathname]);
}

export function useParallax(speed = 0.18) {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReduced()) return;
    const el = ref.current;
    if (!el) return;
    let raf = null;
    const update = () => {
      raf = null;
      const r = el.parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = (r.top + r.height / 2 - vh / 2) / (vh + r.height / 2);
      el.style.transform = `translate3d(0, ${prog * speed * 100}px, 0)`;
    };
    const onScroll = () => { if (raf == null) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);
  return ref;
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = prefersReduced();
  const y = el.getBoundingClientRect().top + window.scrollY - 10;
  window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
}

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'books'))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        console.log('[useBooks] loaded', data.length, 'books:', data.map((b) => ({ id: b.id, title: b.title, featured: b.featured })));
        setBooks(data);
      })
      .catch((err) => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  }, []);

  return { books, loading };
}

export function Placeholder({ label, className = '', style }) {
  return (
    <div
      className={`ph ${className}`}
      data-label={label}
      style={style}
      role="img"
      aria-label={label}
    />
  );
}
