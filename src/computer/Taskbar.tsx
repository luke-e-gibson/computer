import { useContext, useEffect, useState } from "react";
import { WindowingContext } from "./global/global";
import { useCurrentWindow } from "./global/windowing";
import "./style/Taskbar.css";

export default function Taskbar() {
  const windower = useContext(WindowingContext);
  const { currentWindow, setCurrentWindow } = useCurrentWindow(windower);
  const [time, setTime] = useState(new Date());
  const windows = windower.getWindows();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="taskbar">
      <div className="taskbar__start">
        <img src="/icon.png" alt="Start" />
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
                  !window.isMinimized
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
      <div className="taskbar__clock">{formatTime(time)}</div>
    </div>
  );
}