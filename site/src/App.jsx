import { useEffect, useMemo, useState } from 'react';

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

const initialProfile = {
  age: 29,
  heightCm: 175,
  weightKg: 82,
  goal: 'lose_weight',
  activityLevel: 'moderate',
  equipment: 'bodyweight,dumbbells',
  restrictions: ''
};

export function App() {
  const [food, setFood] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [meditation, setMeditation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [authResult, setAuthResult] = useState(null);
  const [profileForm, setProfileForm] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(null);
  const [meals, setMeals] = useState([]);

  const currentUser = authResult?.user;
  const telegramId = useMemo(() => currentUser?.telegramId || currentUser?.id || '', [currentUser]);

  useEffect(() => {
    refreshLeaderboard();
  }, []);

  useEffect(() => {
    if (!telegramId) return;
    fetch(`${API_URL}/api/users/${telegramId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.profile) {
          setSavedProfile(data.user.profile);
          setProfileForm((prev) => ({ ...prev, ...data.user.profile }));
        }
        setMeals(data.user?.meals || []);
      })
      .catch(() => null);
  }, [telegramId]);

  function refreshLeaderboard() {
    fetch(`${API_URL}/api/leaderboard`)
      .then((r) => r.json())
      .then((data) => setLeaderboard(data.entries || []))
      .catch(() => setLeaderboard([]));
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!telegramId) return alert('Login with Telegram first.');

    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, ...profileForm })
    });
    const data = await response.json();
    setSavedProfile(data.profile || null);
  }

  function loadFoodDemo() {
    fetch(`${API_URL}/api/nutrition/analyze-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId })
    })
      .then((r) => r.json())
      .then((data) => {
        setFood(data.result);
        if (data.meal) setMeals((prev) => [data.meal, ...prev]);
        refreshLeaderboard();
      });
  }

  function loadWorkoutDemo() {
    fetch(`${API_URL}/api/workouts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, ...profileForm })
    })
      .then((r) => r.json())
      .then((data) => setWorkout(data.savedWorkout || data.workout));
  }

  function loadMeditationDemo() {
    fetch(`${API_URL}/api/meditations/recommend`)
      .then((r) => r.json())
      .then((data) => setMeditation(data.meditation));
  }

  function completeMeditation() {
    if (!telegramId) return alert('Login with Telegram first.');
    fetch(`${API_URL}/api/meditations/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId, ...(meditation || {}) })
    })
      .then((r) => r.json())
      .then(() => refreshLeaderboard());
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
          {currentUser && <p className="success">Logged in as {currentUser.firstName || currentUser.first_name || currentUser.username}</p>}
          {authResult?.error && <p className="error">{authResult.error}</p>}
        </Section>

        <Section title="Dashboard">
          <p className="metric">{savedProfile?.targetCalories || 2050} kcal target</p>
          <p className="muted">Meals saved: {meals.length} · Weekly leaderboard is database-backed</p>
        </Section>
      </div>

      <div className="grid two-col">
        <Section title="Onboarding profile">
          <form className="form" onSubmit={saveProfile}>
            <label>Age<input name="age" value={profileForm.age || ''} onChange={handleProfileChange} /></label>
            <label>Height, cm<input name="heightCm" value={profileForm.heightCm || ''} onChange={handleProfileChange} /></label>
            <label>Weight, kg<input name="weightKg" value={profileForm.weightKg || ''} onChange={handleProfileChange} /></label>
            <label>Goal
              <select name="goal" value={profileForm.goal || 'maintain'} onChange={handleProfileChange}>
                <option value="lose_weight">Lose weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain_muscle">Gain muscle</option>
                <option value="endurance">Endurance</option>
              </select>
            </label>
            <label>Activity
              <select name="activityLevel" value={profileForm.activityLevel || 'moderate'} onChange={handleProfileChange}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>Equipment<input name="equipment" value={profileForm.equipment || ''} onChange={handleProfileChange} /></label>
            <label>Restrictions<input name="restrictions" value={profileForm.restrictions || ''} onChange={handleProfileChange} /></label>
            <button className="secondary" type="submit">Save profile</button>
          </form>
        </Section>

        <Section title="Food by photo">
          <p className="muted">Current version saves demo analysis to DB. Next step: real file upload + AI vision.</p>
          <button className="secondary" onClick={loadFoodDemo}>Analyze meal demo</button>
          {food && <pre className="result">{JSON.stringify(food, null, 2)}</pre>}
          <h3>Recent meals</h3>
          <ul className="compact-list">
            {meals.map((meal) => <li key={meal.id}>{meal.title} — {meal.calories} kcal</li>)}
          </ul>
        </Section>
      </div>

      <div className="grid">
        <Section title="Personal workout">
          <button className="secondary" onClick={loadWorkoutDemo}>Generate workout</button>
          {workout && <pre className="result">{JSON.stringify(workout, null, 2)}</pre>}
        </Section>

        <Section title="Meditations">
          <button className="secondary" onClick={loadMeditationDemo}>Recommend meditation</button>
          {meditation && <pre className="result">{JSON.stringify(meditation, null, 2)}</pre>}
          {meditation && <button className="secondary" onClick={completeMeditation}>Mark meditation complete</button>}
        </Section>

        <Section title="Leaderboard">
          <ol className="leaderboard">
            {leaderboard.map((entry) => (
              <li key={`${entry.rank}-${entry.name}`}>
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
