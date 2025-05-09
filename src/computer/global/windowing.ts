import { useEffect, useState } from "react";
import { type ReactNode } from "react";

export interface WindowSettings {
  minWidth?: number;
  minHeight?: number;
  title: string;
  icon: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  icon: string;
  isMinimized: boolean;
}

interface RegisteredApp {
  guiFactory: () => ReactNode;
  settings: WindowSettings;
}

const MIN_WIDTH = 250;
const MIN_HEIGHT = 150;

export class Windowing {
  private _currentWindow: string | null = null;
  private windows: {
    [key: string]: WindowState;
  } = {};
  private registeredApps: {
    [key: string]: RegisteredApp;
  } = {};
  private listeners: (() => void)[] = [];

  constructor() {}

  public registerApp(appName: string, guiFactory: () => ReactNode, settings: WindowSettings) {
    this.registeredApps[appName] = {
      guiFactory,
      settings: {
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        defaultWidth: 600,
        defaultHeight: 400,
        ...settings
      }
    };
  }

  public openWindow(appName: string): string | null {
    const app = this.registeredApps[appName];
    if (!app) return null;

    const id = `${appName}-${Date.now()}`;
    const x = Math.floor((window.innerWidth - (app.settings.defaultWidth || 600)) / 2);
    const y = Math.floor((window.innerHeight - (app.settings.defaultHeight || 400)) / 2);

    this.windows[id] = {
      x,
      y,
      width: app.settings.defaultWidth || 600,
      height: app.settings.defaultHeight || 400,
      title: app.settings.title,
      icon: app.settings.icon,
      isMinimized: false
    };

    this._currentWindow = id;
    this.notifyListeners();
    return id;
  }

  public getAppContent(id: string): ReactNode | null {
    const appName = id.split('-')[0];
    const app = this.registeredApps[appName];
    return app ? app.guiFactory() : null;
  }

  public getAppSettings(id: string): WindowSettings | null {
    const appName = id.split('-')[0];
    return this.registeredApps[appName]?.settings || null;
  }

  public registerWindow(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string = "",
    icon: string = ""
  ) {
    this.windows[id] = { x, y, width, height, title, icon, isMinimized: false };
    this.notifyListeners();
  }

  public unregisterWindow(id: string) {
    delete this.windows[id];
    if (this._currentWindow === id) {
      const remainingWindows = Object.keys(this.windows);
      this._currentWindow = remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1] : null;
    }
    this.notifyListeners();
  }

  public updateWindowState(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    isMinimized?: boolean
  ) {
    if (this.windows[id]) {
      this.windows[id] = {
        ...this.windows[id],
        x,
        y,
        width,
        height,
        ...(isMinimized !== undefined && { isMinimized })
      };
      this.notifyListeners();
    }
  }

  public setCurrentWindow(id: string) {
    if (this.windows[id]) {
      this._currentWindow = id;
      this.notifyListeners();
    }
  }

  public getCurrentWindow() {
    return this._currentWindow;
  }

  public getWindows() {
    return this.windows;
  }

  public getRegisteredApps() {
    return this.registeredApps;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

export function useCurrentWindow(windowing: Windowing) {
  const [currentWindow, setCurrentWindow] = useState(
    windowing.getCurrentWindow()
  );

  useEffect(() => {
    const unsubscribe = windowing.subscribe(() => {
      setCurrentWindow(windowing.getCurrentWindow());
    });
    return () => unsubscribe();
  }, [windowing]);

  return { currentWindow, setCurrentWindow: windowing.setCurrentWindow.bind(windowing) };
}