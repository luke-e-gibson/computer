import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./computer/global/global.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

const windower = window._window;

function ExampleApp() {
  const [name, setName] = useState("");
  
  return (
    <>
      <div>
        <h1>Hello world</h1> <label>Name</label>
        <input type="text" onChange={(e)=> {setName(e.target.value)}}/> 
        <p>Hello {name}</p>
      </div>
    </>
  );
}

windower.registerApp("myApp", <ExampleApp />, {
  icon: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
  title: "Test Window",
  minWidth: 250,
  minHeight: 200,
});
const appWindow = windower.openWindow("myApp");
