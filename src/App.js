import './styles/tokens.css';
import './styles/site.css';
import { useReveals } from './hooks';
import Nav from './components/Nav';
import Hero from './components/Hero';
import { About, QuoteBand } from './components/About';
import Books from './components/Books';
import { Speaking, Booking } from './components/Speaking';

export default function App() {
  useReveals();
  return (
    <>
      <a href="#about" className="skip-link">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <About />
        <QuoteBand />
        <Books />
        <Speaking />
        <Booking />
      </main>
    </>
  );
}
