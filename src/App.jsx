import { useEffect, useMemo, useState } from 'react';

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
  const [hands,setHands]=useState([]);
  const [trump,setTrump]=useState(null);
  const [turn,setTurn]=useState(0);
  const [trick,setTrick]=useState([]);
  const [tricks,setTricks]=useState([0,0]);
  const [message,setMessage]=useState('برای شروع، خال حکم را انتخاب کن.');
  const [started,setStarted]=useState(false);
  const [gameOver,setGameOver]=useState(false);
  const [round,setRound]=useState(1);
  const suits=[{symbol:'♠',color:'black',name:'پیک'},{symbol:'♥',color:'red',name:'دل'},{symbol:'♦',color:'red',name:'خشت'},{symbol:'♣',color:'black',name:'گشنیز'}];
  const ranks=[['۲',2],['۳',3],['۴',4],['۵',5],['۶',6],['۷',7],['۸',8],['۹',9],['۱۰',10],['سرباز',11],['بی‌بی',12],['شاه',13],['آس',14]];
  const makeDeck=()=>suits.flatMap(s=>ranks.map(([rank,value])=>({id:s.symbol+'-'+rank,suit:s.symbol,color:s.color,rank,value,suitName:s.name})));
  const shuffle=cards=>{const out=[...cards];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  function deal(){const d=shuffle(makeDeck());setHands([d.slice(0,13),d.slice(13,26),d.slice(26,39),d.slice(39,52)]);setTrump(null);setTurn(0);setTrick([]);setTricks([0,0]);setStarted(false);setGameOver(false);setRound(1);setMessage('کارت‌ها پخش شدند؛ خال حکم را انتخاب کن.');}
  useEffect(()=>{deal();},[]);
  const legalCards=player=>{const h=hands[player]||[];if(!trick.length)return h;const suit=trick[0].card.suit;const follow=h.filter(c=>c.suit===suit);return follow.length?follow:h;};
  const strength=item=>item.card.suit===trump?100+item.card.value:item.card.suit===trick[0]?.card.suit?item.card.value:0;
  function playCard(player,card){
    if(!started||gameOver||player!==turn||trick.length>=4)return;
    if(!legalCards(player).some(c=>c.id===card.id)){setMessage('اگر از خال شروع‌شده کارت داری، باید همان خال را بازی کنی.');return;}
    setHands(prev=>prev.map((h,i)=>i===player?h.filter(c=>c.id!==card.id):h));
    setTrick(prev=>[...prev,{card,player}]);setTurn((player+1)%4);
  }
  useEffect(()=>{
    if(!started||gameOver||turn===0||trick.length>=4||!hands.length)return;
    const timer=setTimeout(()=>{const choices=legalCards(turn);if(choices.length)playCard(turn,choices[Math.floor(Math.random()*choices.length)]);},500);
    return ()=>clearTimeout(timer);
  },[started,gameOver,turn,trick,hands,trump]);
  useEffect(()=>{
    if(trick.length!==4||!started||gameOver)return;
    const timer=setTimeout(()=>{
      const winning=trick.reduce((best,item)=>strength(item)>strength(best)?item:best,trick[0]);
      const team=winning.player%2===0?0:1;const scores=[...tricks];scores[team]++;setTricks(scores);
      setTrick([]);setTurn(winning.player);
      if(scores[team]>=7){setGameOver(true);setMessage(team===0?'تیم شما ۷ دور برد و دست را برد!':'تیم حریف ۷ دور برد.');}
      else if(round>=13){setGameOver(true);setMessage(scores[0]>scores[1]?'دست تمام شد؛ تیم شما برنده است!':scores[0]<scores[1]?'دست تمام شد؛ تیم حریف برنده است.':'دست مساوی شد.');}
      else {setRound(v=>v+1);setMessage('این دور را '+['شما','حریف ۱','هم‌تیمی','حریف ۳'][winning.player]+' برد.');}
    },850);
    return ()=>clearTimeout(timer);
  },[trick,started,gameOver,trump,tricks,round]);
  const names=['شما','حریف ۱','هم‌تیمی','حریف ۳'];const userHand=hands[0]||[];
  return <main className="match-page">
    <header className="match-header"><button className="text-button" onClick={onBack}>← بازگشت</button><div className="brand compact"><span className="brand-mark">۴</span><span>چهاربرگ</span></div><span className="round-pill">دور {round} از ۱۳</span></header>
    <section className="match-title"><span className="eyebrow">{game.id==='hokm'?'بازی چهارنفره با قواعد پایهٔ حکم':'میز آزمایشی'}</span><h1>{game.name}</h1><p>{game.id==='hokm'?'شما و هم‌تیمی در برابر دو حریف بازی می‌کنید.':'قواعد اختصاصی این بازی هنوز آماده نیست.'}</p></section>
    {game.id!=='hokm'?<section className="rules-modal"><h2>به‌زودی</h2><p>در حال حاضر، نسخهٔ قابل‌بازی حکم پیاده‌سازی شده و این بازی در صف توسعه است.</p><button className="primary-button" onClick={onBack}>بازگشت به بازی‌ها ←</button></section>:!started?<section className="rules-modal trump-picker"><span className="eyebrow">مرحلهٔ شروع</span><h2>خال حکم را انتخاب کن</h2><p>۵۲ کارت پخش می‌شود؛ هر بازیکن ۱۳ کارت می‌گیرد. شما و بازیکن روبه‌رو یک تیم هستید.</p><div className="trump-options">{suits.map(s=><button key={s.symbol} className={s.color==='red'?'trump-option red':'trump-option'} onClick={()=>setTrump(s.symbol)} aria-pressed={trump===s.symbol}><strong>{s.symbol}</strong><span>{s.name}</span></button>)}</div><button className="primary-button" disabled={!trump} onClick={()=>{setStarted(true);setMessage('شروع بازی؛ شما اولین کارت را بازی می‌کنی.');}}>شروع بازی ←</button><button className="secondary-button" onClick={deal}>پخش دوبارهٔ کارت‌ها</button></section>:<>
      <section className="table-area"><div className="opponent opponent-top"><div className="avatar">هـ</div><div><b>هم‌تیمی</b><small>تیم شما</small></div><div className="hidden-cards"><Card back/><Card back/><Card back/></div></div><div className="opponent opponent-left"><div className="avatar">ح۱</div><b>حریف ۱</b><div className="hidden-cards"><Card back/><Card back/></div></div><div className="center-table"><div className="table-emblem">{trump}</div><p>خال حکم: {suits.find(s=>s.symbol===trump)?.name}</p><div className="trick-cards">{trick.map((item,i)=><div className="trick-card" key={item.card.id+i}><Card card={item.card} disabled/><small>{names[item.player]}</small></div>)}{!trick.length&&<div className="empty-slot"><span>♠</span><small>{turn===0?'کارت انتخاب کن':'نوبت حریف'}</small></div>}</div></div><div className="opponent opponent-right"><div className="avatar">ح۳</div><b>حریف ۳</b><div className="hidden-cards"><Card back/><Card back/></div></div></section>
      <section className="score-panel"><div><small>تیم شما</small><strong>{tricks[0]}</strong></div><div className="score-divider"></div><div><small>تیم حریف</small><strong>{tricks[1]}</strong></div></section><p className="notice" role="status">{message}</p>
      <section className="hand-section"><div className="hand-heading"><div><span className="eyebrow">{turn===0?'نوبت شما':'نوبت '+names[turn]}</span><h2>کارت‌های دستت</h2></div><span className="card-count">{userHand.length} کارت</span></div><div className="hand-cards">{userHand.map(card=><Card key={card.id} card={card} onClick={()=>playCard(0,card)} disabled={turn!==0||trick.length>=4||gameOver||!legalCards(0).some(c=>c.id===card.id)}/>)}</div><div className="match-actions">{gameOver?<button className="primary-button" onClick={deal}>بازی دوباره ←</button>:<button className="secondary-button" onClick={deal}>شروع دست تازه</button>}<button className="secondary-button" onClick={onBack}>انتخاب بازی</button></div></section>
      <p className="prototype-note">پیروی از خال، برتری خال حکم، نوبت چهارنفره و امتیاز تیمی پیاده‌سازی شده‌اند. انتخاب حاکم بر اساس پنج کارت و بازی آنلاین هنوز اضافه نشده است.</p>
    </>}
  </main>;
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