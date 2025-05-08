import { useEffect, useState } from "react";

export class Windowing {
  private _currentWindow: string | null = null;
  private windows: {
    [key: string]: { x: number; y: number; width: number; height: number };
  } = {};

  private resizeHandleSize: number = 5;
  private minWidth: number = 100;
  private minHeight: number = 100;
  private maxWidth: number = window.innerWidth - this.resizeHandleSize;
  private maxHeight: number = window.innerHeight - this.resizeHandleSize;

  private zIndex: number = 1;

  constructor() {}

  public registerWindow(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.windows[id] = { x, y, width, height };
  }

  public unregisterWindow(id: string) {
    delete this.windows[id];
  }

  public setCurrentWindow(id: string) {
    this._currentWindow = id;
    this.notifyListeners();
  }

  public getCurrentWindow() {
    return this._currentWindow;
  }

  // Listener pattern to notify components of changes
  private listeners: (() => void)[] = [];

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