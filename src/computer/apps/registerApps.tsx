import { NotepadApp } from "./notepad/notepad"
import { SettingsApp } from "./settings/settingsGui"

export function registerApps() {
  const windower = window._window

  console.log("Registering apps...");
  
  windower.registerApp('settings', () => {
    console.log("Rendering Settings app");
    return <SettingsApp />;
  }, {
    title: "Settings",
    icon: "https://cdn-icons-png.flaticon.com/512/3524/3524659.png",
    defaultWidth: 800,
    defaultHeight: 600,
  })

  windower.registerApp('notepad', () => {
    console.log("Rendering Notepad app");
    return <NotepadApp />;
  }, {
    title: "Notepad",
    icon: "https://cdn-icons-png.flaticon.com/512/1828/1828919.png",
    defaultWidth: 800,
    defaultHeight: 600,
  })
  
  console.log("Apps registered:", Object.keys(windower.getRegisteredApps()));
}