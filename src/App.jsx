import React, { useEffect, useMemo, useState } from 'react';

const games = [
  { id: 'hokm', name: 'حُکم', subtitle: 'رقابت تیمی و پیش‌بینی حرکت حریف', icon: '♠', label: 'محبوب' },
  { id: 'shelem', name: 'شِلَم', subtitle: 'امتیازگیری، همکاری و تصمیم‌گیری', icon: '♦', label: 'استراتژیک' },
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
  const [savedInitial] = useState(() => {
    try {
      const raw = localStorage.getItem('charbarg-match-v1');
      const value = raw ? JSON.parse(raw) : null;
      return value && value.gameId === game.id ? value : null;
    } catch { return null; }
  });
  const [hands, setHands] = useState(() => savedInitial?.hands || []);
  const [trump, setTrump] = useState(() => savedInitial?.trump ?? null);
  const [turn, setTurn] = useState(() => savedInitial?.turn ?? 0);
  const [trick, setTrick] = useState(() => savedInitial?.trick || []);
  const [tricks, setTricks] = useState(() => savedInitial?.tricks || [0, 0]);
  const [message, setMessage] = useState(() => savedInitial?.message || 'برای تعیین حاکم، کارت‌کشی را شروع کن.');
  const [stage, setStage] = useState(() => savedInitial?.stage || 'draw');
  const [drawDeck, setDrawDeck] = useState(() => savedInitial?.drawDeck || []);
  const [drawIndex, setDrawIndex] = useState(() => savedInitial?.drawIndex || 0);
  const [hakem, setHakem] = useState(() => savedInitial?.hakem ?? null);
  const [round, setRound] = useState(() => savedInitial?.round || 1);
  const [gameOver, setGameOver] = useState(() => savedInitial?.gameOver || false);
  const suits = [
    { symbol: '♠', color: 'black', name: 'پیک' },
    { symbol: '♥', color: 'red', name: 'دل' },
    { symbol: '♦', color: 'red', name: 'خشت' },
    { symbol: '♣', color: 'black', name: 'گشنیز' }
  ];
  const ranks = [['۲',2],['۳',3],['۴',4],['۵',5],['۶',6],['۷',7],['۸',8],['۹',9],['۱۰',10],['سرباز',11],['بی‌بی',12],['شاه',13],['آس',14]];
  const names = ['شما', 'حریف ۱', 'هم‌تیمی', 'حریف ۳'];
  const makeDeck = () => suits.flatMap(s => ranks.map(([rank,value]) => ({
    id: s.symbol + '-' + rank, suit: s.symbol, color: s.color, rank, value, suitName: s.name
  })));
  const shuffle = cards => {
    const out = [...cards];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const begin = () => {
    setHands([[],[],[],[]]); setTrump(null); setTurn(0); setTrick([]); setTricks([0,0]);
    setGameOver(false); setRound(1); setHakem(null);
    setDrawDeck(shuffle(makeDeck())); setDrawIndex(0); setStage('draw');
    setMessage('کارت‌ها یکی‌یکی رو می‌شوند؛ اولین آس، حاکم را مشخص می‌کند.');
  };
  useEffect(() => { if (!savedInitial) begin(); }, []);
  const drawCard = () => {
    if (stage !== 'draw' || !drawDeck.length) return;
    const card = drawDeck[drawIndex];
    if (!card) return;
    const seat = drawIndex % 4;
    setDrawIndex(i => i + 1);
    if (card.value === 14) {
      setHakem(seat); setStage('firstFive');
      setMessage('آس به ' + names[seat] + ' رسید؛ او حاکم شد.');
      return;
    }
    setMessage('کارت بعدی برای ' + names[(drawIndex + 1) % 4] + ' رو می‌شود.');
  };
  const startFirstFive = () => {
    const deck = shuffle(makeDeck());
    const newHands = [[],[],[],[]];
    newHands[hakem] = deck.slice(0,5);
    setHands(newHands); setDrawDeck(deck.slice(5)); setTrump(null);
    setStage('chooseTrump');
    setMessage('حاکم فقط پنج کارت اول را می‌بیند و خال حکم را انتخاب می‌کند.');
  };
  const finishDeal = suit => {
    const newHands = hands.map(h => [...h]);
    const remaining = shuffle(drawDeck);
    let cursor = 0;
    while (newHands.some(h => h.length < 13) && cursor < remaining.length) {
      for (let offset = 0; offset < 4 && cursor < remaining.length; offset++) {
        const player = (hakem + offset) % 4;
        if (newHands[player].length < 13) newHands[player].push(remaining[cursor++]);
      }
    }
    setHands(newHands.map(h => h.sort((a,b) => suits.findIndex(s=>s.symbol===a.suit)-suits.findIndex(s=>s.symbol===b.suit) || b.value-a.value)));
    setTrump(suit); setTurn(hakem); setStage('play');
    setMessage('حکم ' + suits.find(s=>s.symbol===suit)?.name + ' است. حاکم، ' + names[hakem] + '، اولین کارت را می‌اندازد.');
  };
  const legalCards = (player, currentTrick = trick, currentHands = hands) => {
    const hand = currentHands[player] || [];
    if (!currentTrick.length) return hand;
    const ledSuit = currentTrick[0].card.suit;
    const matching = hand.filter(card => card.suit === ledSuit);
    return matching.length ? matching : hand;
  };
  const itemStrength = (item, ledSuit) => item.card.suit === trump ? 100 + item.card.value : item.card.suit === ledSuit ? item.card.value : 0;
  const winnerOf = currentTrick => {
    const ledSuit = currentTrick[0].card.suit;
    return currentTrick.reduce((best, item) => itemStrength(item, ledSuit) > itemStrength(best, ledSuit) ? item : best, currentTrick[0]);
  };
  const chooseAiCard = player => {
    const hand = legalCards(player);
    if (hand.length <= 1) return hand[0];
    if (!trick.length) {
      const counts = suits.map(s => ({ suit:s.symbol, cards:hand.filter(c=>c.suit===s.symbol) })).sort((a,b)=>b.cards.length-a.cards.length);
      const leadCards = hand.filter(c=>c.suit===counts[0]?.suit).sort((a,b)=>b.value-a.value);
      return leadCards.find(c=>c.value>=13) || leadCards[leadCards.length-1] || hand[0];
    }
    const currentWinner = winnerOf(trick);
    const partnerWinning = currentWinner.player % 2 === player % 2;
    const winningChoices = hand.filter(card => winnerOf([...trick,{card,player}]).player === player).sort((a,b)=>a.value-b.value);
    if (partnerWinning) {
      return hand.filter(c=>c.suit!==trump).sort((a,b)=>a.value-b.value)[0] || hand.slice().sort((a,b)=>a.value-b.value)[0];
    }
    if (winningChoices.length) return winningChoices[0];
    return hand.filter(c=>c.suit!==trump).sort((a,b)=>a.value-b.value)[0] || hand.slice().sort((a,b)=>a.value-b.value)[0];
  };
  const playCardSound = (frequency = 440, duration = 0.07) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + duration);
      oscillator.onended = () => ctx.close();
    } catch {}
  };
  const playCard = (player, card) => {
    if (stage !== 'play' || gameOver || player !== turn || trick.length >= 4) return;
    if (!legalCards(player).some(c => c.id === card.id)) {
      setMessage('اگر از خال شروع‌شده کارت داری، باید همان خال را بازی کنی.'); return;
    }
    playCardSound(card.color === 'red' ? 520 : 390);
    const nextHands = hands.map((hand,index)=>index===player?hand.filter(c=>c.id!==card.id):hand);
    const nextTrick = [...trick, {card,player}];
    setHands(nextHands); setTrick(nextTrick); setTurn((player+1)%4);
    setMessage(names[player] + ' کارت ' + card.rank + ' ' + card.suit + ' را بازی کرد.');
    if (nextTrick.length === 4) {
      const winner = winnerOf(nextTrick);
      const team = winner.player % 2 === 0 ? 0 : 1;
      const nextScores = [...tricks]; nextScores[team]++;
      setTimeout(() => {
        setTricks(nextScores); setTrick([]); setTurn(winner.player);
        if (nextScores[team] >= 7) {
          setGameOver(true); setStage('over'); setMessage('تیم ' + (team===0?'شما':'حریف') + ' به ۷ دست رسید و این هَند را برد.');
        } else if (round >= 13) {
          setGameOver(true); setStage('over');
          setMessage(nextScores[0]===nextScores[1]?'دست مساوی شد.':nextScores[0]>nextScores[1]?'تیم شما برنده شد.':'تیم حریف برنده شد.');
        } else {
          setRound(n=>n+1); setMessage(names[winner.player] + ' این دست را برد؛ همان بازیکن دست بعدی را شروع می‌کند.');
        }
      }, 1000);
    }
  };
  useEffect(() => {
    if (stage !== 'play' || gameOver || turn === 0 || trick.length >= 4 || !hands.length) return;
    const timer = setTimeout(() => {
      const card = chooseAiCard(turn);
      if (card) playCard(turn, card);
    }, 650);
    return () => clearTimeout(timer);
  }, [stage, gameOver, turn, trick, hands, trump]);
  useEffect(() => {
    try {
      localStorage.setItem('charbarg-match-v1', JSON.stringify({
        gameId: game.id, hands, trump, turn, trick, tricks, message, stage,
        drawDeck, drawIndex, hakem, round, gameOver
      }));
    } catch (error) {
      console.warn('FourBarg could not save match state:', error);
    }
  }, [game.id, hands, trump, turn, trick, tricks, message, stage, drawDeck, drawIndex, hakem, round, gameOver]);
  const userHand = hands[0] || [];
  const hakemLabel = hakem === null ? '' : names[hakem];
  return <main className="match-page">
    <header className="match-header"><button className="text-button" onClick={onBack}>← بازگشت</button><div className="brand compact"><span className="brand-mark">۴</span><span>چهاربرگ</span></div><span className="round-pill">{stage==='draw'?'انتخاب حاکم':stage==='chooseTrump'?'انتخاب حکم':stage==='firstFive'?'پنج کارت حاکم':'دست ' + round + ' از ۱۳'}</span></header>
    <section className="match-title"><span className="eyebrow">حکم چهارنفره · نسخهٔ آزمایشی</span><h1>حُکم</h1><p>شما و هم‌تیمی در برابر دو حریف بازی می‌کنید.</p></section>
    {stage==='draw' ? <section className="draw-stage" aria-live="polite">
      <div className="draw-stage-heading"><span className="eyebrow">مرحلهٔ اول · تعیین حاکم</span><h2>تک‌کِشی روی میز</h2><p>کارت‌ها به‌ترتیب بین چهار بازیکن پخش می‌شوند؛ اولین آس، حاکم را مشخص می‌کند.</p></div>
      <div className="draw-game-table">
        <div className="draw-seat draw-seat-top"><b>هم‌تیمی</b><small>تیم شما</small><div className="draw-seat-cards">{Array.from({length:Math.floor(drawIndex/4)+(drawIndex%4>2?1:0)},(_,i)=><span className="draw-mini-back" key={i}>۴</span>)}</div></div>
        <div className="draw-seat draw-seat-left"><b>حریف ۱</b><small>تیم حریف</small><div className="draw-seat-cards">{Array.from({length:Math.floor(drawIndex/4)+(drawIndex%4>1?1:0)},(_,i)=><span className="draw-mini-back" key={i}>۴</span>)}</div></div>
        <div className="draw-seat draw-seat-right"><b>حریف ۳</b><small>تیم حریف</small><div className="draw-seat-cards">{Array.from({length:Math.floor(drawIndex/4)+(drawIndex%4>3?1:0)},(_,i)=><span className="draw-mini-back" key={i}>۴</span>)}</div></div>
        <div className="draw-seat draw-seat-bottom"><b>شما</b><small>تیم شما</small><div className="draw-seat-cards">{Array.from({length:Math.floor(drawIndex/4)+(drawIndex%4>0?1:0)},(_,i)=><span className="draw-mini-back" key={i}>۴</span>)}</div></div>
        <div className="draw-center-pile"><div className="draw-pile-back">۴</div><span className="draw-arrow">↓</span><div className="draw-revealed-card">{drawIndex>0&&drawDeck[drawIndex-1] ? <Card card={drawDeck[drawIndex-1]} disabled/> : <span className="draw-card-placeholder">؟</span>}</div><small>{drawIndex===0?'آمادهٔ کارت‌کشی':'کارت '+drawIndex+' · '+names[(drawIndex-1)%4]}</small></div>
      </div>
      <div className="draw-stage-actions"><button className="primary-button" onClick={drawCard}>پخش کارت بعدی ←</button><button className="secondary-button" onClick={begin}>شروع دوباره</button></div>
    </section> : stage==='firstFive' ? <section className="rules-modal trump-picker">
      <span className="eyebrow">حاکم مشخص شد</span><h2>حاکم: {hakemLabel}</h2><p>دستهٔ ورق دوباره بُر می‌خورد و پنج کارت اول فقط به حاکم داده می‌شود.</p>
      <button className="primary-button" onClick={startFirstFive}>دادن پنج کارت به حاکم ←</button>
    </section> : stage==='chooseTrump' ? <section className="rules-modal trump-picker">
      <span className="eyebrow">مرحلهٔ دوم</span><h2>{hakem===0?'پنج کارت شما':'پنج کارت حاکم'}</h2>
      <p>{hakem===0?'با توجه به همین پنج کارت، خال حکم را انتخاب کن.':'حاکم بر اساس پنج کارت خودش خال حکم را انتخاب می‌کند.'}</p>
      <div className="hand-cards first-five-cards">{hakem===0?(hands[hakem]||[]).map(card=><Card key={card.id} card={card} disabled/>):Array.from({length:5},(_,i)=><Card key={i} back/>)}</div>
      {hakem===0 ? <><div className="trump-options">{suits.map(s=><button key={s.symbol} className={s.color==='red'?'trump-option red':'trump-option'} onClick={()=>setTrump(s.symbol)} aria-pressed={trump===s.symbol}><strong>{s.symbol}</strong><span>{s.name}</span></button>)}</div><button className="primary-button" disabled={!trump} onClick={()=>finishDeal(trump)}>تأیید حکم و پخش بقیهٔ کارت‌ها ←</button></> : <button className="primary-button" onClick={()=>{const hand=hands[hakem]||[];const score=suits.map(s=>({suit:s.symbol,score:hand.filter(c=>c.suit===s.symbol).reduce((sum,c)=>sum+(c.value>=13?c.value-10:c.value>=11?1:0),0)+hand.filter(c=>c.suit===s.symbol).length*2})).sort((a,b)=>b.score-a.score);finishDeal(score[0].suit);}}>انتخاب حکم توسط حاکم ←</button>}
    </section> : <>
      <section className="table-area">
        <div className={'opponent opponent-top ' + (turn===2?'active-seat':'')}><div className="avatar">هـ</div><div><b>هم‌تیمی</b><small>تیم شما{hakem===2?' · حاکم':''}</small></div><div className="hidden-cards"><Card back/><Card back/><Card back/></div></div>
        <div className={'opponent opponent-left ' + (turn===1?'active-seat':'')}><div className="avatar">ح۱</div><b>حریف ۱{hakem===1?' · حاکم':''}</b><div className="hidden-cards"><Card back/><Card back/></div></div>
        <div className="center-table"><div className="table-emblem">{trump}</div><p>حکم: {suits.find(s=>s.symbol===trump)?.name}</p><div className="trick-cards">
          {trick.map(item=><div className={'trick-card played-seat-' + item.player} key={item.card.id}><Card card={item.card} disabled/><small>{names[item.player]}{item.player===hakem?' · حاکم':''}</small><em>کارت {item.card.rank}</em></div>)}
          {!trick.length&&<div className="empty-slot"><span>♠</span><small>{names[turn]} شروع می‌کند</small></div>}
        </div></div>
        <div className={'opponent opponent-right ' + (turn===3?'active-seat':'')}><div className="avatar">ح۳</div><b>حریف ۳{hakem===3?' · حاکم':''}</b><div className="hidden-cards"><Card back/><Card back/></div></div>
      </section>
      <section className="score-panel"><div><small>تیم شما</small><strong>{tricks[0]}</strong></div><div className="score-divider"></div><div><small>تیم حریف</small><strong>{tricks[1]}</strong></div></section>
      <p className="notice" role="status">{message}</p>
      <section className="hand-section"><div className="hand-heading"><div><span className="eyebrow">{turn===0?'نوبت شما':'نوبت '+names[turn]}</span><h2>کارت‌های دستت</h2></div><span className="card-count">{userHand.length} کارت</span></div><div className="hand-cards">{userHand.map(card=><Card key={card.id} card={card} onClick={()=>playCard(0,card)} disabled={turn!==0||trick.length>=4||gameOver||!legalCards(0).some(c=>c.id===card.id)}/>)}</div><div className="match-actions">{gameOver?<button className="primary-button" onClick={begin}>بازی دوباره ←</button>:<button className="secondary-button" onClick={begin}>شروع دست تازه</button>}<button className="secondary-button" onClick={onBack}>انتخاب بازی</button></div></section>
      <p className="prototype-note">تعیین حاکم با تک‌کشی، پنج کارت نخست حاکم، خال‌دادن اجباری و انتخاب منطقی‌تر کارت توسط ربات‌ها پیاده‌سازی شده است.</p>
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
              <div className="game-card-copy"><h3>{game.name}</h3><p>{game.subtitle}</p>{i === 0 ? <button onClick={() => setSelectedGame(game)} className="game-play">ورود به میز <span>←</span></button> : <button type="button" className="game-play game-play-disabled" disabled aria-disabled="true">به‌زودی <span>◷</span></button>}</div>
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