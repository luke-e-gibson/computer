import CalculatorApp from "./calculator/calculator";
import GraphingCalulator from "./graphingCalculator/graphCalculator";
import { NotepadApp } from "./notepad/notepad"
import { SettingsApp } from "./settings/settingsGui"

export function registerApps() {
  const windower = window._window

  console.log("Registering apps...");

  windower.registerApp('settings', () => {
    return <SettingsApp />;
  }, {
    title: "Settings",
    icon: "https://cdn-icons-png.flaticon.com/512/3524/3524659.png",
    defaultWidth: 800,
    defaultHeight: 600,
  })

  windower.registerApp('notepad', () => {
    return <NotepadApp />;
  }, {
    title: "Notepad",
    icon: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
    defaultWidth: 800,
    defaultHeight: 600,
  })

  windower.registerApp('calculator', () => {
    return <CalculatorApp />
  }, {
    icon: "https://cdn-icons-png.flaticon.com/512/2344/2344247.png ",
    title: "Calculator",
    minWidth: 380,
    minHeight: 600,
    defaultWidth: 400,
    defaultHeight: 600,
  })

  windower.registerApp('graphCalculator', () => {
    return <GraphingCalulator />
  }, {
    icon: "https://cdn-icons-png.flaticon.com/512/2344/2344247.png ",
    title: "Graphing Calculator",
    minWidth: 380,
    minHeight: 600,
  })

  console.log("Apps registered:", Object.keys(windower.getRegisteredApps()));
}