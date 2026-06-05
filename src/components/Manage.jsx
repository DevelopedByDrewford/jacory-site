import React, { useState, useEffect, createContext, useContext } from 'react';
import { Link, Outlet, NavLink, useMatch, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

const SECTIONS = [
  {
    label: 'Books',
    description: 'Add, edit, and manage book listings and purchase links.',
    icon: '📚',
    href: '/manage/books',
  },
];

export const ManageBooksCtx = createContext({ books: [], fetchBooks: () => {}, editingId: null, setEditingId: () => {} });

function ManageSidebar() {
  const { books, editingId, setEditingId } = useContext(ManageBooksCtx);
  const navigate = useNavigate();
  const onBooks = useMatch('/manage/books');

  const handleSelect = (book) => {
    if (!onBooks) navigate('/manage/books');
    setEditingId(book.id);
  };

  const handleNew = () => {
    if (!onBooks) navigate('/manage/books');
    setEditingId(null);
  };

  return (
    <aside style={{ width: 240, borderRight: '1px solid #e0ddd8', flexShrink: 0, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 0' }}>
        <NavLink
          to="/manage/books"
          style={({ isActive }) => navLinkStyle(isActive)}
        >
          Books
        </NavLink>
      </div>
      {onBooks && (
        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #e0ddd8', padding: '8px 0' }}>
          {books.map((b) => (
            <button key={b.id} onClick={() => handleSelect(b)} style={sidebarItemBtn(editingId === b.id)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                {b.featured && <span style={{ fontSize: 10, color: '#888', flexShrink: 0 }}>★</span>}
              </span>
            </button>
          ))}
          <button onClick={handleNew} style={{ ...sidebarItemBtn(!editingId && editingId !== undefined), color: '#666' }}>
            + New book
          </button>
        </div>
      )}
    </aside>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 16px' }}>
        <div style={{ background: '#fff', border: '1px solid #e0ddd8', borderRadius: 12, padding: '40px 36px' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>Management Portal</h1>
          <p style={{ margin: '0 0 28px', fontSize: 13, color: '#888' }}>Sign in to continue.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#444' }}>Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={loginInputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: '#444' }}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={loginInputStyle}
              />
            </div>
            {error && <p style={{ margin: 0, fontSize: 13, color: '#c00' }}>{error}</p>}
            <button type="submit" disabled={loading} style={loginBtnStyle}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}>← Return home</Link>
        </div>
      </div>
    </div>
  );
}

export function ManageLayout() {
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  const fetchBooks = () =>
    getDocs(collection(db, 'books')).then((snap) =>
      setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

  useEffect(() => {
    if (user) fetchBooks();
  }, [user]);

  if (user === undefined) return null;
  if (user === null) return <LoginForm />;

  return (
    <ManageBooksCtx.Provider value={{ books, fetchBooks, editingId, setEditingId }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8f7f5', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #e0ddd8', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link to="/manage" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.04em', color: '#1a1a1a', textDecoration: 'none' }}>
            Management Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#aaa' }}>{user.email}</span>
            <button
              onClick={() => signOut(auth)}
              style={{ fontSize: 13, color: '#666', border: '1px solid #e0ddd8', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', background: '#faf9f7' }}
            >
              Sign out
            </button>
            <Link to="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #e0ddd8', borderRadius: 6, background: '#faf9f7' }}>
              ← Return home
            </Link>
          </div>
        </header>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <ManageSidebar />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </ManageBooksCtx.Provider>
  );
}

export default function ManagePortal() {
  return (
    <div style={{ padding: '48px 40px', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#1a1a1a' }}>Content</h1>
      <p style={{ margin: '0 0 40px', fontSize: 14, color: '#777' }}>Select a section to manage.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '28px 24px',
              background: '#fff',
              border: '1px solid #e0ddd8',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'inherit',
              transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1a1a1a';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0ddd8';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>{s.description}</div>
            </div>
            <div style={{ marginTop: 'auto', fontSize: 12, color: '#aaa', paddingTop: 8 }}>Open →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const loginInputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '9px 11px',
  border: '1px solid #d0cdc8', borderRadius: 6, fontSize: 14,
  background: '#fff', color: '#1a1a1a', outline: 'none',
};

const loginBtnStyle = {
  padding: '10px 0', background: '#1a1a1a', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer',
  fontWeight: 600, fontSize: 14, marginTop: 4,
};

const navLinkStyle = (isActive) => ({
  display: 'block', padding: '9px 16px', fontSize: 13, fontWeight: 600,
  textDecoration: 'none', color: isActive ? '#1a1a1a' : '#555',
  background: isActive ? '#f0ede8' : 'none',
  borderLeft: isActive ? '3px solid #1a1a1a' : '3px solid transparent',
});

const sidebarItemBtn = (active) => ({
  display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px',
  background: active ? '#f0ede8' : 'none', border: 'none', cursor: 'pointer', fontSize: 13,
  color: active ? '#1a1a1a' : '#444',
  borderLeft: active ? '3px solid #1a1a1a' : '3px solid transparent',
});
