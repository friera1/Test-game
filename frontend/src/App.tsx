import { useEffect, useMemo, useState } from 'react';
import { Card } from './components/Card';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export function App() {
  const [foodPreview] = useState({ title: 'Chicken rice bowl', calories: 610, protein: 42 });
  const [leaderboard] = useState([
    { rank: 1, name: 'Alex', points: 420 },
    { rank: 2, name: 'Mira', points: 390 },
    { rank: 3, name: 'You', points: 360 }
  ]);

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    window.Telegram?.WebApp?.expand();
  }, []);

  const userName = useMemo(() => {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name ?? 'friend';
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">FitMind AI</p>
          <h1>Hello, {userName}</h1>
          <p className="muted">Track food, train smarter, meditate daily, and climb the rankings.</p>
        </div>
        <button className="primary">Start workout</button>
      </header>

      <div className="grid">
        <Card>
          <h2>Calories today</h2>
          <p className="metric">1,480 / 2,050 kcal</p>
          <p className="muted">Protein 96g · Fat 48g · Carbs 154g</p>
        </Card>

        <Card>
          <h2>Food photo result</h2>
          <p className="metric">{foodPreview.title}</p>
          <p className="muted">{foodPreview.calories} kcal · {foodPreview.protein}g protein</p>
          <button className="secondary">Analyze new photo</button>
        </Card>

        <Card>
          <h2>Workout of the day</h2>
          <ul>
            <li>Bodyweight squats — 3×12</li>
            <li>Push-ups — 3×10</li>
            <li>Plank — 3×30 sec</li>
          </ul>
        </Card>

        <Card>
          <h2>Meditation</h2>
          <p className="metric">7-minute stress reset</p>
          <p className="muted">Breathing, shoulder release, gentle body scan.</p>
        </Card>

        <Card>
          <h2>Leaderboard</h2>
          <ol className="leaderboard">
            {leaderboard.map((entry) => (
              <li key={entry.rank}>
                <span>#{entry.rank} {entry.name}</span>
                <strong>{entry.points}</strong>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </main>
  );
}
