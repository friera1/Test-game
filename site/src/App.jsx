import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TELEGRAM_BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME || 'your_bot_username';

function Section({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function App() {
  const [food, setFood] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [meditation, setMeditation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [authResult, setAuthResult] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`)
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.entries || []))
      .catch(() => setLeaderboard([]));
  }, []);

  function loadFoodDemo() {
    fetch(`${API_URL}/api/nutrition/analyze-photo`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setFood(data.result));
  }

  function loadWorkoutDemo() {
    fetch(`${API_URL}/api/workouts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: 'lose_weight', activityLevel: 'moderate', weightKg: 82, heightCm: 175, age: 29 })
    })
      .then((r) => r.json())
      .then((data) => setWorkout(data.workout));
  }

  function loadMeditationDemo() {
    fetch(`${API_URL}/api/meditations/recommend`)
      .then((r) => r.json())
      .then((data) => setMeditation(data.meditation));
  }

  useEffect(() => {
    window.onTelegramAuth = async function (user) {
      const response = await fetch(`${API_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      setAuthResult(data);
    };

    const container = document.getElementById('telegram-login');
    if (!container || container.childNodes.length) return;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    container.appendChild(script);
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">FitMind AI</p>
          <h1>Fitness website connected to Telegram bot</h1>
          <p className="muted">Login with Telegram, analyze meals, get training plans, meditate, and climb the leaderboard.</p>
        </div>
        <a className="primary" href={`https://t.me/${TELEGRAM_BOT_NAME}`} target="_blank" rel="noreferrer">Open bot</a>
      </header>

      <div className="grid two-col">
        <Section title="Telegram login">
          <div id="telegram-login" />
          {authResult && (
            <pre className="result">{JSON.stringify(authResult, null, 2)}</pre>
          )}
        </Section>

        <Section title="Dashboard">
          <p className="metric">1,480 / 2,050 kcal</p>
          <p className="muted">Workout streak: 5 days · Meditation streak: 3 days</p>
        </Section>
      </div>

      <div className="grid">
        <Section title="Food by photo">
          <p className="muted">This starter version uses demo data. Next step: file upload + AI vision pipeline.</p>
          <button className="secondary" onClick={loadFoodDemo}>Analyze meal demo</button>
          {food && <pre className="result">{JSON.stringify(food, null, 2)}</pre>}
        </Section>

        <Section title="Personal workout">
          <button className="secondary" onClick={loadWorkoutDemo}>Generate workout demo</button>
          {workout && <pre className="result">{JSON.stringify(workout, null, 2)}</pre>}
        </Section>

        <Section title="Meditations">
          <button className="secondary" onClick={loadMeditationDemo}>Recommend meditation</button>
          {meditation && <pre className="result">{JSON.stringify(meditation, null, 2)}</pre>}
        </Section>

        <Section title="Leaderboard">
          <ol className="leaderboard">
            {leaderboard.map((entry) => (
              <li key={entry.rank}>
                <span>#{entry.rank} {entry.name}</span>
                <strong>{entry.points}</strong>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </main>
  );
}
