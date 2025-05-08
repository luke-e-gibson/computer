import { useContext } from "react";
import { WindowingContext } from "./global/global";
import { useCurrentWindow } from "./global/windowing"
import "./style/Taskbar.css"


export default function Taskbar() {
  const windower = useContext(WindowingContext)
  const {currentWindow, setCurrentWindow} = useCurrentWindow(windower);
  
  return (
    <div className="taskbar">
      <div className="taskbar__start">
        <img src="/icon.png" alt="Start" />
      </div>
      <div className="taskbar__apps">
        {currentWindow}
      </div>
      <div className="taskbar__clock">
        {/* Render clock here */}
      </div>
    </div>
  )
}