import { useContext, useEffect, useState } from "react";
import "./style/WebOs.css";
import Taskbar from "./Taskbar";
import { Window } from "./Window";
import { WindowingContext } from "./global/global";
import { type ReactNode } from "react";
import { useLocalStorage } from "./global/storage/localStore";
import type { SettingsStore } from "./apps/settings/settingsGui";

interface WebOsProps {
  children?: ReactNode;
}

export default function WebOs({ children }: WebOsProps) {
  const windower = useContext(WindowingContext);
  const [windows, setWindows] = useState(() => windower.getWindows());
  const [store, setStore] = useLocalStorage<SettingsStore>('settings', { theme: 'light' });

  useEffect(() => {
    // Initialize apps when component mounts
    window.createApps();
    // Subscribe to window changes and update state
    const unsubscribe = windower.subscribe(() => {
      setWindows({ ...windower.getWindows() });
    });
    return () => unsubscribe();
  }, []);

  const handleCloseWindow = (windowId: string) => {
    windower.unregisterWindow(windowId);
  };

  const handleThemeChange = (selectedTheme: string) => {
    setStore({ theme: selectedTheme });
    document.documentElement.setAttribute('data-theme', selectedTheme);
  };

  useEffect(() => {
    if (store && store.theme) {
      console.log('Settings store:', store);
      handleThemeChange(store.theme);
    }
  }, [])

  return (
    <div className="webos">
      {Object.keys(windows).map((windowId) => (
        <Window
          key={windowId}
          windowId={windowId}
          onClose={() => handleCloseWindow(windowId)}
        />
      ))}
      <Taskbar />
      {children}
    </div>
  );
}