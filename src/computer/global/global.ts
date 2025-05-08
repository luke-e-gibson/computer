import React from 'react';
import { useState } from "react";
import { MouseHandler } from "./mouseHandler";
import { Windowing } from './windowing';
import { registerApps } from '../apps/registerApps';


//Init Globals

window._mouse = new MouseHandler()
window._window = new Windowing()
window._registerApp = window._window.registerApp.bind(window._window)
window.createApps = registerApps


declare global {
  interface Window {
    _mouse: MouseHandler,
    _window: Windowing, 
    _registerApp: (appName: string, gui: React.ReactNode, settings: { icon: string; title: string; minWidth?: number; minHeight?: number; }) => void;
    createApps: () => void;
  }
}

export const WindowingContext = React.createContext<Windowing>(window._window);