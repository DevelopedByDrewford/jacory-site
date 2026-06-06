import './styles/tokens.css';
import './styles/site.css';
import { Routes, Route } from 'react-router-dom';
import { useReveals, usePageTracking } from './hooks';
import Nav from './components/Nav';
import Hero from './components/Hero';
import { About, QuoteBand } from './components/About';
import Books from './components/Books';
import { Speaking } from './components/Speaking';
import { Contact } from './components/Contact';
import Manage, { ManageLayout } from './components/Manage';
import ManageBooks from './components/ManageBooks';
import ManageHero from './components/ManageHero';
import ManageSpeaking from './components/ManageSpeaking';
import ManageAbout from './components/ManageAbout';
import ManageQuoteBand from './components/ManageQuoteBand';
import ManageContact from './components/ManageContact';
import ManageSubmissions from './components/ManageSubmissions';
import ManageAnalytics from './components/ManageAnalytics';
import ManageBaseball from './components/ManageBaseball';
import Baseball from './components/Baseball';
import ManageSpotlight from './components/ManageSpotlight';
import Spotlight from './components/Spotlight';
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
        <About />
        <Speaking />
        <Baseball />
        <Spotlight />
        <QuoteBand />
        <Contact />
      </main>
    </>
  );
}

function PageTracker() {
  usePageTracking();
  return null;
}

export default function App() {
  return (
    <>
      <PageTracker />
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/manage" element={<ManageLayout />}>
          <Route index element={<Manage />} />
          <Route path="hero" element={<ManageHero />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="speaking" element={<ManageSpeaking />} />
          <Route path="about" element={<ManageAbout />} />
          <Route path="quoteband" element={<ManageQuoteBand />} />
          <Route path="contact" element={<ManageContact />} />
          <Route path="submissions" element={<ManageSubmissions />} />
          <Route path="analytics" element={<ManageAnalytics />} />
          <Route path="baseball" element={<ManageBaseball />} />
          <Route path="spotlight" element={<ManageSpotlight />} />
        </Route>
      </Routes>
      <CmdK />
    </>
  );
}
