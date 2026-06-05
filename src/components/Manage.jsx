import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const SECTIONS = [
  {
    label: 'Books',
    description: 'Add, edit, and manage book listings and purchase links.',
    icon: '📚',
    href: '/manage/books',
  },
];

export function ManageLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8f7f5', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1a1a1a' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e0ddd8', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Link to="/manage" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.04em', color: '#1a1a1a', textDecoration: 'none' }}>
          Management Portal
        </Link>
        <Link to="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #e0ddd8', borderRadius: 6, background: '#faf9f7' }}>
          ← Return home
        </Link>
      </header>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
    </div>
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
