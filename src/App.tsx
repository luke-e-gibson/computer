import { useEffect } from "react"
import WebOs from "./computer/WebOs"
import "./computer/style/global.css"

function App() {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <WebOs></WebOs>
  )
}


export default App
