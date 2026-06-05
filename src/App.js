import './styles/tokens.css';
import './styles/site.css';
import { Routes, Route } from 'react-router-dom';
import { useReveals } from './hooks';
import Nav from './components/Nav';
import Hero from './components/Hero';
import { About, QuoteBand } from './components/About';
import Books from './components/Books';
import { Speaking } from './components/Speaking';
import { Booking } from './components/Booking';
import Manage, { ManageLayout } from './components/Manage';
import ManageBooks from './components/ManageBooks';
import CmdK from './components/CmdK';

function Site() {
  useReveals();
  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <Books />
        <Speaking />
        <About />
        <QuoteBand />
        <Booking />
      </main>
    </>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/manage" element={<ManageLayout />}>
          <Route index element={<Manage />} />
          <Route path="books" element={<ManageBooks />} />
        </Route>
      </Routes>
      <CmdK />
    </>
  );
}
