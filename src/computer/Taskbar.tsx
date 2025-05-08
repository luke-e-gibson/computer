import { useContext, useEffect, useRef, useState } from "react";
import "./style/Taskbar.css";
import { WindowingContext } from "./global/global";
import { useCurrentWindow } from "./global/windowing";

const Clock = () => {
  const clockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      if(!clockRef.current) return
      clockRef.current.innerText = now.toLocaleTimeString();
    };
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return <div ref={clockRef} className="taskbar__clock">Loading...</div>;
};

export default function Taskbar() {
  const windower = useContext(WindowingContext);
  const { currentWindow, setCurrentWindow } = useCurrentWindow(windower);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const windows = windower.getWindows();

  const launchApp = (appName: string) => {
    const windowId = windower.openWindow(appName);
    if (windowId) {
      setCurrentWindow(windowId);
      setIsAppDrawerOpen(false);
    }
  };

  return (
    <div className="taskbar">
      <div className="taskbar__start" onClick={() => setIsAppDrawerOpen(!isAppDrawerOpen)}>
        <img src="/icon.png" alt="Start" />
      </div>
      <div className={`taskbar__applications ${isAppDrawerOpen ? 'open' : ''}`}>
        <span className="taskbar__applications-text">Applications</span>
        <div className="taskbar__applications-icons">
          {Object.entries(windower.getRegisteredApps()).map(([appName, app]) => (
            <div key={appName} className="taskbar__app-icon-wrapper" onClick={() => launchApp(appName)}>
              <img src={app.settings.icon} alt={app.settings.title} />
              <span className="taskbar__app-title">{app.settings.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="taskbar__apps">
        {Object.entries(windows).map(([id, window]) => (
          <div
            key={id}
            className={`taskbar__app ${currentWindow === id ? "active" : ""} ${
              window.isMinimized ? "minimized" : ""
            }`}
            onClick={() => {
              if (window.isMinimized) {
                windower.updateWindowState(
                  id,
                  window.x,
                  window.y,
                  window.width,
                  window.height,
                  false
                );
              }
              setCurrentWindow(id);
            }}
          >
            <img src={window.icon} alt={window.title} className="taskbar__app-icon" />
            <span className="taskbar__app-title">{window.title}</span>
          </div>
        ))}
      </div>
      <div><Clock/></div>
    </div>
  );
}