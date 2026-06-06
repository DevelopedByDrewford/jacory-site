import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const BEEP_P1 = 'Beep baseball is a full-contact sport designed for athletes who are blind or visually impaired. The ball beeps. The bases buzz. And every swing is an act of pure faith — you can\'t see the pitch coming, only hear it.';
const BEEP_P2 = 'For Jacory, the diamond wasn\'t a consolation prize. It was proof. That a body navigating the world without sight could still feel the thrill of a hit, the burn of a sprint, the roar of a crowd responding to something it just witnessed.';
const CHAMP_P1 = 'In 2022, Jacory\'s team, Indy Edge, took the field at the National Beep Baseball Association Championship — a tournament where blind athletes from across the country compete at the highest level the sport offers.';
const CHAMP_P2 = 'It\'s the same year he started writing. The same year he stood in front of crowds and told his story for the first time. He has often said that the championship wasn\'t just about baseball — it was the moment he stopped waiting for permission to compete.';

export default function Baseball() {
  const [beepUrl, setBeepUrl] = useState('');
  const [beepAlt, setBeepAlt] = useState('');
  const [champUrl, setChampUrl] = useState('');
  const [champAlt, setChampAlt] = useState('');
  const [beepP1, setBeepP1] = useState(BEEP_P1);
  const [beepP2, setBeepP2] = useState(BEEP_P2);
  const [beepCtaLabel, setBeepCtaLabel] = useState('');
  const [beepCtaLink, setBeepCtaLink] = useState('');
  const [champP1, setChampP1] = useState(CHAMP_P1);
  const [champP2, setChampP2] = useState(CHAMP_P2);
  const [champCtaLabel, setChampCtaLabel] = useState('');
  const [champCtaLink, setChampCtaLink] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'config', 'beepBaseball'))
      .then((snap) => {
        if (!snap.exists()) return;
        const { activeUrl, activeAlt } = snap.data();
        if (activeUrl) setBeepUrl(activeUrl);
        if (activeAlt) setBeepAlt(activeAlt);
      })
      .catch(() => {});
    getDoc(doc(db, 'config', 'championship'))
      .then((snap) => {
        if (!snap.exists()) return;
        const { activeUrl, activeAlt } = snap.data();
        if (activeUrl) setChampUrl(activeUrl);
        if (activeAlt) setChampAlt(activeAlt);
      })
      .catch(() => {});
    getDoc(doc(db, 'config', 'beepBaseballText'))
      .then((snap) => {
        if (!snap.exists()) return;
        const { p1, p2, ctaLabel, ctaLink } = snap.data();
        if (p1) setBeepP1(p1);
        if (p2) setBeepP2(p2);
        if (ctaLabel) setBeepCtaLabel(ctaLabel);
        if (ctaLink) setBeepCtaLink(ctaLink);
      })
      .catch(() => {});
    getDoc(doc(db, 'config', 'championshipText'))
      .then((snap) => {
        if (!snap.exists()) return;
        const { p1, p2, ctaLabel, ctaLink } = snap.data();
        if (p1) setChampP1(p1);
        if (p2) setChampP2(p2);
        if (ctaLabel) setChampCtaLabel(ctaLabel);
        if (ctaLink) setChampCtaLink(ctaLink);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section baseball" id="baseball">
      <div className="wrap">
        <div className="section-eyebrow reveal">
          <span className="eyebrow">Baseball</span>
          <span className="num">04</span>
          <span className="ln" />
        </div>

        <div id="beep-baseball" className="bb-block">
          <div className="bb-header">
            <p className="bb-sub-eyebrow reveal">Beep Baseball</p>
            <h2 className="bb-title reveal d1">
              The game that plays <em>by sound</em>
            </h2>
          </div>
          <div className="bb-body">
            <div className="bb-text reveal d2">
              <p>{beepP1}</p>
              <p>{beepP2}</p>
              {beepCtaLink && (
                <a href={beepCtaLink} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  {beepCtaLabel || 'Learn more'} <span className="arr">&rarr;</span>
                </a>
              )}
            </div>
            <div className="bb-visual reveal d3">
              {beepUrl ? (
                <img
                  src={beepUrl}
                  alt={beepAlt}
                  style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  className="ph"
                  data-label="Beep baseball — player mid-swing, ball trailing sound"
                  style={{ aspectRatio: '4 / 3' }}
                />
              )}
            </div>
          </div>
        </div>

        <div id="championship-2022" className="bb-block">
          <div className="bb-header">
            <p className="bb-sub-eyebrow reveal">Championship</p>
            <h2 className="bb-title reveal d1">
              <em>2022</em> — The year it all landed
            </h2>
          </div>
          <div className="bb-body bb-body--flip">
            <div className="bb-visual reveal d2">
              {champUrl ? (
                <img
                  src={champUrl}
                  alt={champAlt}
                  style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  className="ph"
                  data-label="2022 Championship — team photo, gold light, diamond in background"
                  style={{ aspectRatio: '4 / 3' }}
                />
              )}
            </div>
            <div className="bb-text reveal d3">
              <p>{champP1}</p>
              <p>{champP2}</p>
              {champCtaLink && (
                <a href={champCtaLink} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  {champCtaLabel || 'Learn more'} <span className="arr">&rarr;</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
