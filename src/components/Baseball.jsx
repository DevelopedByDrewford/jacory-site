import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Baseball() {
  const [beepUrl, setBeepUrl] = useState('');
  const [champUrl, setChampUrl] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'config', 'beepBaseball'))
      .then((snap) => { if (snap.exists() && snap.data().activeUrl) setBeepUrl(snap.data().activeUrl); })
      .catch(() => {});
    getDoc(doc(db, 'config', 'championship'))
      .then((snap) => { if (snap.exists() && snap.data().activeUrl) setChampUrl(snap.data().activeUrl); })
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
              <p>
                <strong>Beep baseball</strong> is a full-contact sport designed for athletes who are blind or visually
                impaired. The ball beeps. The bases buzz. And every swing is an act of pure faith — you can't see the
                pitch coming, only hear it.
              </p>
              <p>
                For Jacory, the diamond wasn't a consolation prize. It was proof. That a body navigating the world
                without sight could still feel the thrill of a hit, the burn of a sprint, the roar of a crowd responding
                to something it just witnessed.
              </p>
            </div>
            <div className="bb-visual reveal d3">
              {beepUrl ? (
                <img
                  src={beepUrl}
                  alt="Beep baseball — player mid-swing"
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
                  alt="2022 Championship — team photo"
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
              <p>
                In 2022, Jacory's team, Indy Edge, took the field at the National Beep Baseball Association Championship — a
                tournament where blind athletes from across the country compete at the highest level the sport offers.
              </p>
              <p>
                It's the same year he started writing. The same year he stood in front of crowds and told his story for
                the first time. He has often said that the championship wasn't just about baseball — it was the moment
                he stopped waiting for permission to compete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
