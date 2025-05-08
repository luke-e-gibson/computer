import { useContext, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import "./style/Window.css";
import { useCurrentWindow } from "./global/windowing";
import { WindowingContext } from "./global/global";

interface WindowProps {
  children: React.ReactNode;
  window: {
    minWidth: number;
    minHeight: number;
    id?: string;
    title: string;
    icon: string;
  };
  onClose?: () => void;
}

const RESIZE_HANDLE_SIZE = 5;

export function Window({ children, window: windowSettings, onClose }: WindowProps) {
  const windowId = useState(() => windowSettings.id || nanoid())[0];
  const [position, setPosition] = useState(() => ({
    x: Math.random() * (window.innerWidth - windowSettings.minWidth),
    y: Math.random() * (window.innerHeight - windowSettings.minHeight - 40)
  }));
  const [size, setSize] = useState({
    width: windowSettings.minWidth,
    height: windowSettings.minHeight,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const windower = useContext(WindowingContext);
  const { currentWindow, setCurrentWindow } = useCurrentWindow(windower);
  const headerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const preMaximizeState = useRef({ position: position, size: size });

  useEffect(() => {
    windower.registerWindow(windowId, position.x, position.y, size.width, size.height);
    return () => {
      windower.unregisterWindow(windowId);
    };
  }, []);

  useEffect(() => {
    windower.updateWindowState(windowId, position.x, position.y, size.width, size.height);
  }, [position.x, position.y, size.width, size.height]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current || isMaximized) return;
    const windowElement = headerRef.current.parentElement as HTMLDivElement;
    const offsetX = e.clientX - windowElement.getBoundingClientRect().left;
    const offsetY = e.clientY - windowElement.getBoundingClientRect().top;

    setCurrentWindow(windowId);

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        newX = Math.max(0, Math.min(newX, window.innerWidth - windowElement.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - windowElement.offsetHeight - 40));
        setPosition({ x: newX, y: newY });
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleResize = (e: React.MouseEvent, direction: "right" | "bottom" | "bottom-right") => {
    e.preventDefault();
    if (isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = size.width;
    const initialHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = initialWidth;
      let newHeight = initialHeight;

      if (direction === "right" || direction === "bottom-right") {
        newWidth = Math.max(
          windowSettings.minWidth,
          Math.min(window.innerWidth - position.x, initialWidth + (e.clientX - startX))
        );
      }
      if (direction === "bottom" || direction === "bottom-right") {
        newHeight = Math.max(
          windowSettings.minHeight,
          Math.min(window.innerHeight - position.y - 40, initialHeight + (e.clientY - startY))
        );
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(preMaximizeState.current.position);
      setSize(preMaximizeState.current.size);
    } else {
      preMaximizeState.current = { position, size };
      setPosition({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 40
      });
    }
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div
      className={`window ${isMaximized ? 'window-maximized' : ''}`}
      ref={windowRef}
      onClick={() => {
        if (currentWindow !== windowId) {
          setCurrentWindow(windowId);
        }
      }}
      style={{
        zIndex: currentWindow === windowId ? 2 : 1,
        width: `${size.width}px`,
        height: `${size.height}px`,
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: windowSettings.minWidth,
        minHeight: windowSettings.minHeight,
      }}
    >
      <div className="window-header" ref={headerRef} onMouseDown={handleDragStart}>
        <div className="window-header-left">
          <img src={windowSettings.icon} alt="icon" className="window-icon" />
          <span className="window-title">{windowSettings.title}</span>
        </div>
        <div className="window-controls">
          <button className="window-button minimize" onClick={handleMinimize}>─</button>
          <button className="window-button maximize" onClick={handleMaximize}>□</button>
          <button className="window-button close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="window-content">{children}</div>

      {!isMaximized && (
        <>
          <div
            className="resize-handle resize-right"
            onMouseDown={(e) => handleResize(e, "right")}
          />
          <div
            className="resize-handle resize-bottom"
            onMouseDown={(e) => handleResize(e, "bottom")}
          />
          <div
            className="resize-handle resize-bottom-right"
            onMouseDown={(e) => handleResize(e, "bottom-right")}
          />
        </>
      )}
    </div>
  );
}
