import { useEffect, useState } from "react";

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  icon: string;
  isMinimized: boolean;
}

export class Windowing {
  private _currentWindow: string | null = null;
  private windows: {
    [key: string]: WindowState;
  } = {};
  private listeners: (() => void)[] = [];

  constructor() {}

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

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

// Custom hook to access the windowing context and subscribe to changes
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