import { useContext, useEffect, useState } from "react";
import "./style/WebOs.css";
import Taskbar from "./Taskbar";
import { Window } from "./Window";
import { WindowingContext } from "./global/global";
import { type ReactNode } from "react";

interface WebOsProps {
  children?: ReactNode;
}

export default function WebOs({ children }: WebOsProps) {
  const windower = useContext(WindowingContext);
  const [windows, setWindows] = useState(() => windower.getWindows());

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