import { useContext, useState } from "react";
import "./style/WebOs.css";
import Taskbar from "./Taskbar";
import { Window } from "./Window";
import { WindowingContext } from "./global/global";
import { ReactNode } from "react";

interface WebOsProps {
  children?: ReactNode;
}

export default function WebOs({ children }: WebOsProps) {
  const windower = useContext(WindowingContext);
  const windows = windower.getWindows();

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
    </div>
  );
}