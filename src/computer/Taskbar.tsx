import { useContext, useEffect, useState, useRef } from "react";
import { WindowingContext } from "./global/global";
import { useCurrentWindow } from "./global/windowing";
import "./style/Taskbar.css";

export default function Taskbar() {
  const windower = useContext(WindowingContext);
  const { currentWindow, setCurrentWindow } = useCurrentWindow(windower);
  const [time, setTime] = useState(new Date());
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const appDrawerRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLDivElement>(null);
  const windows = windower.getWindows();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isAppDrawerOpen &&
        appDrawerRef.current &&
        startButtonRef.current &&
        !appDrawerRef.current.contains(event.target as Node) &&
        !startButtonRef.current.contains(event.target as Node)
      ) {
        setIsAppDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAppDrawerOpen]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartClick = () => {
    setIsAppDrawerOpen(!isAppDrawerOpen);
  };

  const launchApp = (appName: string) => {
    windower.openWindow(appName);
    setIsAppDrawerOpen(false);
  };

  return (
    <div className="taskbar">
      <div ref={startButtonRef} className="taskbar__start" onClick={handleStartClick}>
        <img src="/icon.png" alt="Start" />
      </div>
      <div ref={appDrawerRef} className={`taskbar__applications ${isAppDrawerOpen ? 'open' : ''}`}>
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
              if (currentWindow === id && !window.isMinimized) {
                windower.updateWindowState(
                  id,
                  window.x,
                  window.y,
                  window.width,
                  window.height,
                  true
                );
              } else {
                windower.updateWindowState(
                  id,
                  window.x,
                  window.y,
                  window.width,
                  window.height,
                  false
                );
                setCurrentWindow(id);
              }
            }}
          >
            <img src={window.icon} alt={window.title} className="taskbar__app-icon" />
            <span className="taskbar__app-title">{window.title}</span>
          </div>
        ))}
      </div>
      <div className="taskbar__clock">{formatTime(time)}</div>
    </div>
  );
}