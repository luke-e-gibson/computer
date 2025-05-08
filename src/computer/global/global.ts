import React from 'react';
import { useState } from "react";
import { MouseHandler } from "./mouseHandler";
import { Windowing } from './windowing';


//Init Globals

window._mouse = new MouseHandler()
window._window = new Windowing()

declare global {
  interface Window {
    _mouse: MouseHandler,
    _window: Windowing, 
  }
}

export const WindowingContext = React.createContext<Windowing>(window._window);