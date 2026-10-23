import { useMemo, useState } from 'react';

const games = [
  { id: 'hokm', name: 'حُکم', subtitle: 'رقابت تیمی و پیش‌بینی حرکت حریف', icon: '♠', label: 'محبوب' },
  { id: 'shele m', name: 'شِلَم', subtitle: 'امتیازگیری، همکاری و تصمیم‌گیری', icon: '♦', label: 'استراتژیک' },
  { id: 'pasoor', name: 'پاسور', subtitle: 'یک بازی کلاسیک برای دورهمی', icon: '♥', label: 'کلاسیک' }
];

const suits = [
  { symbol: '♠', color: 'black', name: 'پیک' },
  { symbol: '♥', color: 'red', name: 'دل' },
  { symbol: '♦', color: 'red', name: 'خشت' },
  { symbol: '♣', color: 'black', name: 'گشنیز' }
];
const ranks = [
  { label: '۷', value: 7 }, { label: '۸', value: 8 }, { label: '۹', value: 9 },
  { label: '۱۰', value: 10 }, { label: 'سرباز', value: 11 }, { label: 'بی‌بی', value: 12 },
  { label: 'شاه', value: 13 }, { label: 'آس', value: 14 }
];
const makeDeck = () => suits.flatMap(s => ranks.map(r => ({
  id: s.symbol + '-' + r.label, suit: s.symbol, color: s.color, rank: r.label, value: r.value
})));
const shuffle = (cards) => {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

function Card({ card, onClick, disabled = false, back = false }) {
  if (back) return <div className="playing-card card-back" aria-label="کارت پشت‌ورو"><span>۴</span></div>;
  return (
    <button type="button" className={`playing-card ${card.color}`} onClick={onClick} disabled={disabled} aria-label={`${card.rank} ${card.suit}`}>
      <span className="card-rank">{card.rank}</span><span className="card-suit">{card.suit}</span><span className="card-corner">{card.suit}</span>
    </button>
  );
}

function Match({ game, onBack }) {
  const [seed, setSeed] = useState(1);
  const [hand, setHand] = useState(() => shuffle(makeDeck()).slice(0, 8));
  const [trick, setTrick] = useState([]);
  const [score, setScore] = useState({ you: 0, rivals: 0 });
  const [notice, setNotice] = useState('یک کارت انتخاب کن. این نسخه نمایشی است و قوانین کامل رقابتی هنوز پیاده‌سازی نشده‌اند.');

  function startNewHand() {
    setHand(shuffle(makeDeck()).slice(0, 8));
    setTrick([]);
    setScore({ you: 0, rivals: 0 });
    setSeed(n => n + 1);
    setNotice('دست تازه پخش شد؛ بازی را شروع کن.');
  }

  function play(card) {
    if (trick.length) {
      setNotice('برای شروع دور بعد، دکمه «دور بعد» را بزن.');
      return;
    }
    const rivals = shuffle(makeDeck().filter(c => !hand.some(h => h.id === c.id))).slice(0, 3);
    const nextTrick = [{ ...card, player: 'شما' }, ...rivals.map((c, i) => ({ ...c, player: ['حریف ۱', 'حریف ۲', 'حریف ۳'][i] }))];
    setHand(prev => prev.filter(c => c.id !== card.id));
    setTrick(nextTrick);
    const winning = nextTrick.reduce((best, c) => c.value > best.value ? c : best, nextTrick[0]);
    if (winning.player === 'شما') {
      setScore(prev => ({ ...prev, you: prev.you + 1 }));
      setNotice('این دور را بردی! برای ادامه، «دور بعد» را انتخاب کن.');
    } else {
      setScore(prev => ({ ...prev, rivals: prev.rivals + 1 }));
      setNotice(`${winning.player} این دور را برد. دور بعدی را شروع کن.`);
    }
  }

  function nextTrick() {
    if (!hand.length) {
      startNewHand();
      return;
    }
    setTrick([]);
    setNotice('دور جدید؛ کارت بعدی را انتخاب کن.');
  }

  return (
    <main className="match-page">
      <header className="match-header">
        <button className="text-button" onClick={onBack}>← بازگشت</button>
        <div className="brand compact"><span className="brand-mark">۴</span><span>چهاربرگ</span></div>
        <span className="round-pill">دست {seed}</span>
      </header>
      <section className="match-title">
        <span className="eyebrow">میز بازی آزمایشی</span>
        <h1>{game.name}</h1>
        <p>فعلاً نسخه‌ی اولیه برای آزمایش ظاهر و تعامل کارت‌هاست.</p>
      </section>
      <section className="table-area">
        <div className="opponent opponent-top"><div className="avatar">ح۱</div><div><b>حریف اول</b><small>کارت‌های پنهان</small></div><div className="hidden-cards"><Card back /><Card back /><Card back /></div></div>
        <div className="opponent opponent-left"><div className="avatar">ح۲</div><b>حریف دوم</b><div className="hidden-cards"><Card back /><Card back /></div></div>
        <div className="center-table">
          <div className="table-emblem">۴</div>
          <p>میز چهاربرگ</p>
          <div className="trick-cards">
            {trick.length ? trick.map((c, i) => <div className="trick-card" key={c.id + i}><Card card={c} disabled /><small>{c.player}</small></div>) : <div className="empty-slot"><span>♠</span><small>کارتت را بازی کن</small></div>}
          </div>
        </div>
        <div className="opponent opponent-right"><div className="avatar">ح۳</div><b>حریف سوم</b><div className="hidden-cards"><Card back /><Card back /></div></div>
      </section>
      <section className="score-panel">
        <div><small>امتیاز شما</small><strong>{score.you}</strong></div>
        <div className="score-divider"></div>
        <div><small>امتیاز حریف‌ها</small><strong>{score.rivals}</strong></div>
      </section>
      <p className="notice" role="status">{notice}</p>
      <section className="hand-section">
        <div className="hand-heading"><div><span className="eyebrow">نوبت شما</span><h2>کارت‌های دستت</h2></div><span className="card-count">{hand.length} کارت</span></div>
        <div className="hand-cards">{hand.map(card => <Card key={card.id} card={card} onClick={() => play(card)} disabled={!!trick.length} />)}</div>
        <div className="match-actions"><button className="primary-button" onClick={nextTrick}>{hand.length ? 'دور بعد' : 'پخش دست تازه'} <span>←</span></button><button className="secondary-button" onClick={startNewHand}>شروع دوباره</button></div>
      </section>
      <p className="prototype-note">نسخه‌ی آزمایشی: قواعد کامل حکم، شلم و پاسور، بازی آنلاین و حساب کاربری در مراحل بعد اضافه می‌شوند.</p>
    </main>
  );
}

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [tab, setTab] = useState('games');
  const [showRules, setShowRules] = useState(false);
  const stats = useMemo(() => [{ number: '۰۳', label: 'بازی در مسیر ساخت' }, { number: '۱۰۰٪', label: 'فارسی و راست‌چین' }, { number: 'رایگان', label: 'شروع بازی' }], []);

  if (selectedGame) return <Match game={selectedGame} onBack={() => setSelectedGame(null)} />;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={e => { e.preventDefault(); setTab('games'); }}>
          <span className="brand-mark">۴</span><span>چهاربرگ<small>بازی، فکر، رقابت</small></span>
        </a>
        <nav className="desktop-nav"><button className={tab === 'games' ? 'active' : ''} onClick={() => setTab('games')}>بازی‌ها</button><button onClick={() => setShowRules(true)}>راهنما</button><button onClick={() => setTab('about')}>درباره پروژه</button></nav>
        <button className="header-cta" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}>شروع بازی <span>↙</span></button>
      </header>

      {tab === 'about' ? (
        <main className="about-page">
          <span className="eyebrow">درباره چهاربرگ</span><h1>یک میز تازه برای بازی‌های آشنا.</h1>
          <p>چهاربرگ پروژه‌ای برای ساخت تجربه‌ای فارسی، ساده و خوش‌ساخت از بازی‌های کارتی محبوب است. این نسخه شروع کار است و با بازخورد کاربران کامل‌تر می‌شود.</p>
          <button className="primary-button" onClick={() => setTab('games')}>دیدن بازی‌ها ←</button>
        </main>
      ) : (
        <main id="home">
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow"><span className="live-dot"></span> دنیای بازی‌های کارتی فارسی</span>
              <h1>هر دست،<br /><em>یک داستان تازه.</em></h1>
              <p>بنشین پای میز. کارت‌ها را بچین. با فکر بازی کن. چهاربرگ، خانه‌ی بازی‌های کارتی محبوب توست.</p>
              <div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}>انتخاب بازی <span>←</span></button><button className="quiet-button" onClick={() => setShowRules(true)}>چطور بازی کنم؟</button></div>
              <div className="hero-stats">{stats.map(s => <div key={s.label}><strong>{s.number}</strong><small>{s.label}</small></div>)}</div>
            </div>
            <div className="hero-art" aria-label="تصویر تزئینی کارت‌های بازی">
              <div className="art-glow"></div><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
              <div className="art-card card-a"><small>آس</small><strong>♠</strong><span>♠</span></div>
              <div className="art-card card-b"><small>شاه</small><strong>♥</strong><span>♥</span></div>
              <div className="art-card card-c"><small>بی‌بی</small><strong>♦</strong><span>♦</span></div>
              <div className="art-stamp">بازی<br /><b>کن!</b></div><div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div>
            </div>
            <div className="hero-bottomline"><span>طراحی‌شده برای موبایل</span><span>●</span><span>فارسی، ساده، روان</span><span>●</span><span>همیشه در حال رشد</span></div>
          </section>

          <section id="games" className="games-section">
            <div className="section-heading"><div><span className="eyebrow">میز بازی را انتخاب کن</span><h2>کدوم بازی رو می‌چینی؟</h2></div><span className="section-count">۰۱ / ۰۳</span></div>
            <div className="game-grid">{games.map((game, i) => <article className={`game-card game-card-${i + 1}`} key={game.id}>
              <div className="game-card-top"><span className="game-icon">{game.icon}</span><span className="game-label">{game.label}</span></div>
              <div className="game-illustration"><div className="mini-card mini-card-back">۴</div><div className="mini-card mini-card-front"><span>{game.icon}</span><small>{i === 0 ? 'A' : i === 1 ? 'K' : 'Q'}</small></div><span className="illustration-star">✦</span></div>
              <div className="game-card-copy"><h3>{game.name}</h3><p>{game.subtitle}</p><button onClick={() => setSelectedGame(game)} className="game-play">ورود به میز <span>←</span></button></div>
            </article>)}</div>
            <p className="section-footnote">بازی‌ها در حال توسعه‌اند؛ نسخه‌ی فعلی برای آزمایش اولیه‌ی رابط کاربری است.</p>
          </section>

          <section className="promise-section"><div className="promise-symbol">✳</div><div><span className="eyebrow">نگاه چهاربرگ</span><h2>قانون ساده است:<br /><em>بازی باید حال بدهد.</em></h2></div><p>رابط فارسی، طراحی خلوت و تجربه‌ای که از صفحه‌ی گوشی شروع می‌شود. امکانات تازه مرحله‌به‌مرحله اضافه خواهند شد.</p></section>
        </main>
      )}

      <footer className="site-footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">۴</span><span>چهاربرگ<small>بازی، فکر، رقابت</small></span></a><span>ساخته‌شده برای دوست‌داران بازی‌های کارتی</span><span>© چهاربرگ</span></footer>

      {showRules && <div className="modal-backdrop" role="presentation" onClick={() => setShowRules(false)}><section className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowRules(false)} aria-label="بستن">×</button><span className="eyebrow">راهنمای سریع</span><h2 id="rules-title">از اینجا شروع کن</h2><p>فعلاً می‌توانی وارد میز آزمایشی شوی و تعامل با کارت‌ها را امتحان کنی.</p><ul><li>یکی از سه بازی را انتخاب کن.</li><li>روی یک کارت از دستت بزن.</li><li>بعد از پایان دور، «دور بعد» را انتخاب کن.</li></ul><p className="modal-warning">توجه: این نسخه هنوز قوانین رسمی هر بازی یا بازی چندنفره‌ی آنلاین را اجرا نمی‌کند.</p><button className="primary-button" onClick={() => { setShowRules(false); document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' }); }}>متوجه شدم ←</button></section></div>}
    </div>
  );
}