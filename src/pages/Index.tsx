import { useState, useEffect, useRef, useCallback } from "react";

const TRACKS = {
  slide0: "https://files.catbox.moe/ubv8vo.mp3",
  slide1: "https://files.catbox.moe/ubv8vo.mp3",
  slide2: "https://files.catbox.moe/y2pkz4.mp3",
  slide3: "https://files.catbox.moe/dhkehr.mp3",
  slide4: "https://files.catbox.moe/hf20bx.mp3",
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(targetDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function Feather({ style }: { style: React.CSSProperties }) {
  return (
    <div className="feather" style={style}>
      <svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M20 78 C20 78 8 55 8 35 C8 18 14 5 20 2 C26 5 32 18 32 35 C32 55 20 78 20 78Z" fill="currentColor" opacity="0.3"/>
        <path d="M20 78 L20 2" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
        <path d="M20 15 C14 20 9 28 8 35" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        <path d="M20 25 C14 30 9 38 8 45" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        <path d="M20 35 C14 40 9 48 8 55" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        <path d="M20 15 C26 20 31 28 32 35" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        <path d="M20 25 C26 30 31 38 32 45" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        <path d="M20 35 C26 40 31 48 32 55" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
      </svg>
    </div>
  );
}

function FeathersBg({ color = "white", count = 12 }: { color?: string; count?: number }) {
  const feathers = useRef(
    Array.from({ length: count }, (_, i) => ({
      left: `${5 + Math.random() * 90}%`,
      animDelay: `${Math.random() * 8}s`,
      animDuration: `${8 + Math.random() * 8}s`,
      size: `${25 + Math.random() * 35}px`,
      rotate: `${-30 + Math.random() * 60}deg`,
      opacity: 0.15 + Math.random() * 0.3,
      key: i,
    }))
  );

  return (
    <div className="feathers-container" aria-hidden="true">
      {feathers.current.map((f) => (
        <Feather
          key={f.key}
          style={{
            left: f.left,
            animationDelay: f.animDelay,
            animationDuration: f.animDuration,
            width: f.size,
            height: `calc(${f.size} * 2)`,
            transform: `rotate(${f.rotate})`,
            opacity: f.opacity,
            color,
          }}
        />
      ))}
    </div>
  );
}

const BIRTHDAY = new Date("2026-06-27T17:30:00");

export default function Index() {
  const [slide, setSlide] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const [visible, setVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeLeft = useCountdown(BIRTHDAY);

  const playTrack = useCallback((src: string, loop = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = 0.75;
    audio.play().catch(() => {});
    audioRef.current = audio;
  }, []);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const goToSlide = useCallback((next: number) => {
    setVisible(false);
    setTimeout(() => {
      setSlide(next);
      setVisible(true);
    }, 600);
  }, []);

  const handleStart = () => {
    setMusicStarted(true);
    playTrack(TRACKS.slide0, true);
  };

  const handleNext = (nextSlide: number) => {
    stopTrack();
    goToSlide(nextSlide);
    setTimeout(() => {
      if (nextSlide === 1) playTrack(TRACKS.slide1, true);
      else if (nextSlide === 2) playTrack(TRACKS.slide2);
      else if (nextSlide === 3) playTrack(TRACKS.slide3);
      else if (nextSlide === 4) playTrack(TRACKS.slide4);
    }, 650);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="spotira-root">
      <div className={`slide-wrap ${visible ? "slide-in" : "slide-out"}`}>
        {slide === 0 && (
          <SlideZero
            timeLeft={timeLeft}
            pad={pad}
            onStart={handleStart}
            onNext={() => goToSlide(1)}
            musicStarted={musicStarted}
          />
        )}
        {slide === 1 && <SlideOne onNext={() => handleNext(2)} />}
        {slide === 2 && <SlideTwo onNext={() => handleNext(3)} />}
        {slide === 3 && <SlideThree onNext={() => handleNext(4)} />}
        {slide === 4 && <SlideFive />}
      </div>
    </div>
  );
}

interface SlideZeroProps {
  timeLeft: TimeLeft;
  pad: (n: number) => string;
  onStart: () => void;
  onNext: () => void;
  musicStarted: boolean;
}

function SlideZero({ timeLeft, pad, onStart, onNext, musicStarted }: SlideZeroProps) {
  return (
    <div className="slide slide-zero">
      <FeathersBg color="#c8a97e" count={14} />
      <div className="slide-content">
        <div className="logo-wrap">
          <span className="logo-spot">spot</span>
          <span className="logo-ira">IRA</span>
          <span className="logo-year">2026</span>
        </div>
        <div className="hero-text">
          <p className="hero-sub">не просто музыкальные итоги</p>
          <p className="hero-main">а приглашение отметить мои 30</p>
        </div>
        <p className="hero-greeting">Привет, Валя,<br />это для тебя 💌</p>

        <div className="countdown-box">
          <p className="countdown-label">до праздника осталось</p>
          <div className="countdown-units">
            <div className="cunit"><span className="cnum">{pad(timeLeft.days)}</span><span className="clabel">дней</span></div>
            <div className="cdot">:</div>
            <div className="cunit"><span className="cnum">{pad(timeLeft.hours)}</span><span className="clabel">часов</span></div>
            <div className="cdot">:</div>
            <div className="cunit"><span className="cnum">{pad(timeLeft.minutes)}</span><span className="clabel">минут</span></div>
            <div className="cdot">:</div>
            <div className="cunit"><span className="cnum">{pad(timeLeft.seconds)}</span><span className="clabel">секунд</span></div>
          </div>
        </div>

        <div className="btn-group">
          {!musicStarted ? (
            <button className="btn-primary" onClick={onStart}>
              <span className="btn-icon">▶</span> нажми сюда
            </button>
          ) : (
            <button className="btn-secondary" onClick={onNext}>
              смотреть итоги →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideOne({ onNext }: { onNext: () => void }) {
  return (
    <div className="slide slide-one">
      <FeathersBg color="#fff" count={10} />
      <div className="slide-content">
        <div className="track-badge">сейчас играет</div>
        <div className="vinyl-wrap">
          <div className="vinyl">
            <div className="vinyl-inner" />
          </div>
        </div>
        <p className="slide-caption">
          Коллега, сама судьба свела нас однажды и заключила в объятья. Давай продолжать дарить друг другу много крутых моментов и не останавливаться — планировать следующие поездки.
        </p>
        <button className="btn-primary" onClick={onNext}>далее →</button>
      </div>
    </div>
  );
}

function SlideTwo({ onNext }: { onNext: () => void }) {
  return (
    <div className="slide slide-two">
      <FeathersBg color="#e8d5f5" count={16} />
      <div className="circles-bg">
        <div className="circle c1" />
        <div className="circle c2" />
        <div className="circle c3" />
      </div>
      <div className="slide-content">
        <p className="slide-eyebrow">момент с тобой</p>
        <p className="slide-body">
          Помнишь наш каждый вечер, когда мы играли в музыкальные игры у тебя на балконе? Как распаковывали альбомы в ожидании биаса, как поехали отмечать дни рождения на другой конец планеты? И ещё много разных важных для меня вещей — спасибо тебе за эти моменты.
        </p>
        <button className="btn-primary btn-light" onClick={onNext}>
          что там дальше? →
        </button>
      </div>
    </div>
  );
}



function SlideThree({ onNext }: { onNext: () => void }) {
  return (
    <div className="slide slide-three">
      <FeathersBg color="#f0e6ff" count={12} />
      <div className="circles-bg">
        <div className="circle c1" />
        <div className="circle c2" />
        <div className="circle c3" />
      </div>
      <div className="slide-content">
        <p className="slide-eyebrow">момент с тобой</p>
        <p className="slide-body">
          Помнишь наш каждый вечер, когда мы играли в музыкальные игры у тебя на балконе? Как распаковывали альбомы в ожидании биаса, как поехали отмечать дни рождения на другой конец планеты? И ещё много разных важных для меня вещей — спасибо тебе за эти моменты.
        </p>
        <button className="btn-primary btn-light" onClick={onNext}>
          что там дальше? →
        </button>
      </div>
    </div>
  );
}


const PROGRAM = [
  { time: "17:30 — 18:30", desc: "Сбор, лёгкий перекус, первые тосты" },
  { time: "18:30 — 20:30", desc: "Вкусно кушаем, вкусно пьём и проходим квиз по Иришке" },
  { time: "20:30 — 22:00", desc: "Слушаем музыку, общаемся" },
];

function SlideFive() {
  return (
    <div className="slide slide-five">
      <FeathersBg color="#ffd700" count={18} />
      <div className="slide-content">
        <div className="final-header">
          <span className="logo-spot">spot</span><span className="logo-ira">IRA</span>
        </div>
        <p className="final-invite">Жду тебя</p>
        <p className="final-date">27 июня в 17:30</p>
        <p className="final-address">
          Московский проспект 139А,<br />
          м. Электросила<br />
          <span className="final-note">(вход с торца здания через железную калитку)</span>
        </p>
        <p className="final-phone">Мой номер знаешь!</p>

        <div className="final-theme">
          Тематика праздника:{" "}
          <a
            href="https://docs.google.com/document/d/19nD4DwoFk2GaUhR5G1j0_YAmeqTiTXoMtmebOjLU_JA/edit?tab=t.0"
            target="_blank"
            rel="noreferrer"
            className="final-link"
          >
            Eurovision ✨
          </a>
        </div>

        <div className="program-block">
          <p className="program-title">Что тебя ждёт?</p>
          {PROGRAM.map((p, i) => (
            <div className="program-item" key={i}>
              <span className="program-time">{p.time}</span>
              <span className="program-desc">{p.desc}</span>
            </div>
          ))}
        </div>

        <p className="final-detail-hint">нажми, чтобы узнать подробности</p>

        <div className="final-btns">
          <a
            href="https://docs.google.com/document/d/19nD4DwoFk2GaUhR5G1j0_YAmeqTiTXoMtmebOjLU_JA/edit?tab=t.0"
            target="_blank"
            rel="noreferrer"
            className="btn-primary btn-final"
          >
            Подробности
          </a>
          <a
            href="https://docs.google.com/spreadsheets/d/1Ku3rdanulnFMoDGRRYnycAnj4sJThtFrm7mCLC-oufE/edit?gid=0#gid=0"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary btn-final"
          >
            Wishlist 🎁
          </a>
        </div>
      </div>
    </div>
  );
}