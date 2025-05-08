import { SettingsApp } from "./settings/settingsGui"

export function registerApps() {
  const windower = window._window

  windower.registerApp('settings', <SettingsApp />,  {
    title: "Settings",
    icon: "settings",
    defaultWidth: 800,
    defaultHeight: 600,
  })
}