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


windower.registerApp("Github", <iframe src="https://example.com" style={{width: "100%", height: "100%", overflow: "hidden", border: "none"}} sandbox=""/>, {icon: "https://cdn-icons-png.flaticon.com/512/1384/1384028.png ", title: "Example.com", minWidth: 250, minHeight: 200});
const appWindow2 = windower.openWindow("Github");