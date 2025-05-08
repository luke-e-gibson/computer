import "./style/WebOs.css"
import Taskbar from "./Taskbar";

interface WebOsProps {
  children: React.ReactNode;
}

export default function WebOs({children}: WebOsProps) {
  return (
    <div className="webos">
        {children}
        <Taskbar />
    </div>
  )
}