import { resetLocalStorage, useLocalStorage } from '../../global/storage/localStore';
import './settingsGui.css';
import { useEffect, useState } from 'react';

export interface SettingsStore {
  theme: string | null;
}

export function SettingsApp() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');
  const [store, setStore] = useLocalStorage<SettingsStore>('settings', { theme });

  useEffect(() => {
    if (store && store.theme) {
      console.log('Settings store:', store);
      setTheme(store.theme);
      handleThemeChange(store.theme);
    }
  }, [])


  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setStore({ theme: selectedTheme });
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

        <div className='settings-option'>
          <h2>Storage Options</h2>

          <button onClick={() => resetLocalStorage() }>Reset KV Storage</button>
        </div>
      </div>
    </div>
  );
}