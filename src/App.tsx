import WebOs from "./computer/WebOs"
import { Window } from "./computer/Window"

function App() {
  
  return (
    <WebOs>
      <Window window={{icon: "icon.png", minHeight: 200, minWidth: 300, title: "Hello world"}}>
        <h1>Hello world</h1>  
      </Window> 
      <Window window={{icon: "icon.png", minHeight: 200, minWidth: 300, title: "Hello world"}}>
        <h1>Hello world</h1>
      </Window>
    </WebOs>
  )
}

export default App
