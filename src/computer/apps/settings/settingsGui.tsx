import './settingsGui.css';
import { useState } from 'react';

export function SettingsApp() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
  };

  return (
    <div className="settings-app">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-option">
          <label>
            Theme:
            <select 
              value={theme} 
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}