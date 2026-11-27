import React, { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Brain, CheckCircle2, ChevronLeft, GraduationCap, Headphones, Home, Info, Search, Sparkles, Trophy, Volume2, X } from "lucide-react";
import englishGames from "./data/allLanguageGames.js";

const CATEGORIES = [
  { id: "All", label: "همه فعالیت‌ها", icon: "🌈" },
  { id: "Vocabulary", label: "واژگان", icon: "🧠" },
  { id: "Grammar", label: "گرامر", icon: "📝" },
  { id: "Speaking", label: "مکالمه", icon: "🗣️" },
  { id: "Reading", label: "خواندن", icon: "📖" },
  { id: "Spelling", label: "املاء", icon: "🔤" },
  { id: "Listening", label: "شنیداری", icon: "🎧" },
];

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase().replace(/[ًٌٍَُِّْـ]/g, "");

function readProgress() {
  try { return JSON.parse(localStorage.getItem("linguaplay-progress") || "{}"); }
  catch { return {}; }
}

function Header({ page, onHome, onAbout }) {
  return <header className="topbar">
    <button className="brand" onClick={onHome} aria-label="خانه"><span className="brand-mark">🌍</span><span><b>LinguaPlay</b><small>Learn • Play • Grow</small></span></button>
    <nav><button className={page === "home" ? "nav-active" : ""} onClick={onHome}><Home size={17}/> خانه</button><button className={page === "about" ? "nav-active" : ""} onClick={onAbout}><Info size={17}/> درباره ما</button></nav>
  </header>;
}

function GameCard({ game, completed, onClick }) {
  return <button className="game-card" onClick={onClick}>
    <span className="game-icon">{game.icon || "🎯"}</span>
    <span className="game-category">{game.category || "Practice"}</span>
    <strong>{game.title}</strong>
    <span className="game-description">{game.description}</span>
    <span className="game-footer"><span>{game.difficulty || "Practice"}</span>{completed ? <span className="done"><CheckCircle2 size={15}/> انجام‌شده</span> : <span>شروع تمرین <ChevronLeft size={16}/></span>}</span>
  </button>;
}

function About({ onHome }) {
  return <main className="page-wrap">
    <section className="about-hero"><div className="hero-symbol">🌍</div><p className="eyebrow">LANGUAGE LEARNING, REIMAGINED</p><h1>درباره LinguaPlay</h1><p>محیطی مستقل برای یادگیری زبان با بازی، تمرین هدفمند و پیشرفت قابل مشاهده.</p></section>
    <section className="about-grid">
      <article><BookOpen/><h3>یادگیری مرحله‌ای</h3><p>تمرین واژگان، گرامر و مهارت‌های زبانی با مسیرهای ساده و قابل پیگیری.</p></article>
      <article><Brain/><h3>بازی با مکانیک‌های متنوع</h3><p>آزمون، تطبیق، مرتب‌سازی، واژه‌سازی و تمرین پاسخ کوتاه؛ هر فعالیت متناسب با نوع محتوا.</p></article>
      <article><Trophy/><h3>پیشرفت محلی</h3><p>ثبت وضعیت فعالیت‌ها روی دستگاه؛ بدون نیاز اجباری به حساب ابری یا سرویس آنلاین.</p></article>
    </section>
    <section className="creator"><h2>👨‍💻 سازنده و توسعه‌دهنده</h2><strong>Seyed Mehdi Hosseini</strong><p>مهندس نرم‌افزار و توسعه‌دهنده علاقه‌مند به هوش مصنوعی و فناوری</p><a href="mailto:dev.smh.ai@gmail.com">dev.smh.ai@gmail.com</a><div className="creator-links"><a href="https://github.com/SMH-AI-Dev">GitHub</a><a href="https://huggingface.co/SMH-DEV-AI">Hugging Face</a></div></section>
    <button className="primary-btn centered" onClick={onHome}>بازگشت به فعالیت‌ها</button>
  </main>;
}

function GameSession({ game, onClose, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState([]);
  const [sortAnswers, setSortAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const items = game.engine === "quiz" ? (game.questions || []) :
    game.engine === "type" || game.engine === "fillblank" ? (game.questions || []) :
    game.engine === "scramble" ? (game.words || []) :
    game.engine === "match" ? (game.cards || []) :
    game.engine === "sort" ? (game.items || []) : [];
  const current = items[index] || {};
  const total = items.length;
  const done = (finalScore = score) => { setFinished(true); onComplete(finalScore); };
  const advance = (correct) => {
    if (correct) setScore(v => v + 1);
    setFeedback(correct ? "درست بود! آفرین 🌟" : "این بار درست نبود؛ پاسخ را بررسی کن.");
    setTimeout(() => {
      setFeedback("");
      setSelected(null);
      setTyped("");
      if (index + 1 >= total) done(score + (correct ? 1 : 0));
      else setIndex(v => v + 1);
    }, 650);
  };

  if (finished) return <div className="session-overlay"><section className="session-card result-card"><div className="result-emoji">🏆</div><h2>تمرین تمام شد!</h2><p>امتیاز شما</p><strong className="score">{score} / {total}</strong><p>{score === total ? "عالی بود! همه پاسخ‌ها درست بودند." : "تمرین دوباره به تثبیت یادگیری کمک می‌کند."}</p><button className="primary-btn" onClick={onClose}>بازگشت به فهرست</button></section></div>;

  const submitTyped = () => {
    const expected = current.answer ?? current.correctAnswer ?? "";
    advance(normalize(typed) === normalize(expected));
  };
  const prompt = current.question || current.hint || current.text || current.q || "پاسخ درست را پیدا کن";

  return <div className="session-overlay"><section className="session-card">
    <div className="session-top"><span>{game.icon} {game.title}</span><button onClick={onClose} aria-label="بستن"><X/></button></div>
    <div className="progress-track"><span style={{width: total ? ((index + 1) / total * 100) + "%" : "0%"}}/></div>
    <div className="session-meta"><span>تمرین {index + 1} از {total}</span><span>⭐ {score} امتیاز</span></div>
    {game.engine === "match" ? <><h2>جفت درست را پیدا کن</h2><div className="match-grid">{[current.text, current.en].map((label, i) => <button key={i} className={matched.includes(index + "-" + i) ? "choice selected" : "choice"} onClick={() => { const key=index+"-"+i; const next=[...matched,key]; setMatched(next); if (next.includes(index+"-0") && next.includes(index+"-1")) advance(true); }}>{label || current.emoji}</button>)}</div></> :
    game.engine === "sort" ? <><h2>این مورد را در کدام دسته قرار می‌دهی؟</h2><p className="question-text">{current.label || current.text || current.item}</p><div className="choices">{(game.categories || []).map((cat) => <button key={cat.name} className="choice" onClick={() => advance((current.category || current.group) === cat.name)}>{cat.name}</button>)}</div></> :
    <><h2 className="question-text">{prompt}</h2>{game.engine === "quiz" ? <div className="choices">{(current.options || []).map((option, i) => <button key={i} className={selected === i ? "choice selected" : "choice"} onClick={() => {setSelected(i); advance(i === current.correctIndex);}}>{option}</button>)}</div> :
    game.engine === "scramble" ? <><div className="scrambled">{current.scrambled || current.word || "🔤"}</div><input value={typed} onChange={e=>setTyped(e.target.value)} placeholder="کلمه درست را بنویس..." onKeyDown={e=>e.key==="Enter"&&submitTyped()}/><button className="primary-btn" onClick={submitTyped}>بررسی پاسخ</button></> :
    <><input value={typed} onChange={e=>setTyped(e.target.value)} placeholder="پاسخ را اینجا بنویس..." onKeyDown={e=>e.key==="Enter"&&submitTyped()}/><button className="primary-btn" onClick={submitTyped}>بررسی پاسخ</button></>}
    </>}
    {feedback && <p className={feedback.startsWith("درست") ? "feedback good" : "feedback"}>{feedback}</p>}
  </section></div>;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const [progress, setProgress] = useState(readProgress);
  const games = useMemo(() => englishGames.filter(g => (category === "All" || g.category === category) && (normalize(g.title).includes(normalize(search)) || normalize(g.description).includes(normalize(search)))), [category, search]);
  const completedCount = Object.keys(progress).length;
  const finishGame = (score) => {
    const next = {...progress, [activeGame.id]: {score, completedAt: new Date().toISOString()}};
    setProgress(next);
    localStorage.setItem("linguaplay-progress", JSON.stringify(next));
  };

  return <div className="app-shell">
    <Header page={page} onHome={()=>setPage("home")} onAbout={()=>setPage("about")}/>
    {page === "about" ? <About onHome={()=>setPage("home")}/> : <main className="page-wrap">
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow">✨ A BETTER WAY TO LEARN</span><h1>زبان را <em>بازی کن!</em></h1><p>با تمرین‌های کوتاه و بازی‌های متنوع، قدم‌به‌قدم زبان انگلیسی را یاد بگیر.</p><div className="hero-stats"><span>🎯 {englishGames.length} فعالیت</span><span>🏅 {completedCount} فعالیت انجام‌شده</span><span>🔒 ذخیره محلی</span></div></div>
        <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span>📚</span><b>ABC</b><i>🌟</i></div>
      </section>
      <section className="section-heading"><div><p className="eyebrow">YOUR NEXT STEP</p><h2>از کجا شروع کنیم؟</h2></div><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجوی درس یا بازی..."/></div></section>
      <div className="category-row">{CATEGORIES.map(c=><button key={c.id} onClick={()=>setCategory(c.id)} className={category===c.id?"category active":"category"}>{c.icon} {c.label}</button>)}</div>
      <section className="games-grid">{games.map(game=><GameCard key={game.id} game={game} completed={!!progress[game.id]} onClick={()=>setActiveGame(game)}/>)}</section>
      {!games.length && <div className="empty">فعالیتی با این مشخصات پیدا نشد. عبارت دیگری جست‌وجو کن.</div>}
      <footer className="footer">ساخته‌شده برای یادگیری بهتر 💜 <button onClick={()=>setPage("about")}>درباره LinguaPlay</button></footer>
    </main>}
    {activeGame && <GameSession key={activeGame.id} game={activeGame} onClose={()=>setActiveGame(null)} onComplete={finishGame}/>}
  </div>;
}