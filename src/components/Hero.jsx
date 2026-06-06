import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParallax, scrollToId } from '../hooks';

const FALLBACK_URL = 'https://photos.smugmug.com/photos/i-sjLJSDw/0/NHTsmXxrTrLWxQ6XpSJwkS5553vb4fVjHkWCJDjsw/XL/i-sjLJSDw-XL.jpg';

export default function Hero() {
  const imgRef = useParallax(0.16);
  const [heroUrl, setHeroUrl] = useState(FALLBACK_URL);

  useEffect(() => {
    getDoc(doc(db, 'config', 'hero'))
      .then((snap) => {
        if (snap.exists() && snap.data().activeUrl) setHeroUrl(snap.data().activeUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="hero" id="top">
      <div ref={imgRef} className="hero-img">
        <img
          src={heroUrl}
          alt="Full-bleed atmospheric portrait — Jacory at the plate in beep baseball, dusk light"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="hero-veil" />
      <div className="hero-inner">
        <p className="eyebrow hero-eyebrow reveal in">The story of Jacory Wiley</p>
        <h1 className="hero-quote reveal in d1">
          "I can't see it. So I learned to <em>imagine</em> it."
        </h1>
        <p className="hero-attr reveal in d2">Author · Speaker · Beep&nbsp;Baseball</p>
      </div>
      <button
        className="scrollcue"
        onClick={() => scrollToId('books')}
        aria-label="Scroll to read more"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span>Begin</span>
        <span className="ln" />
      </button>
    </header>
  );
}
