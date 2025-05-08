import { useContext, useEffect, useRef, useState } from "react";
import "./style/Window.css";
import { useCurrentWindow } from "./global/windowing";
import { WindowingContext } from "./global/global";

interface WindowProps {
  windowId: string;
  onClose?: () => void;
}


export function Window({ windowId, onClose }: WindowProps) {
  const windower = useContext(WindowingContext);
  console.log(`Window component rendering for ${windowId}`);
  const appSettings = windower.getAppSettings(windowId);
  console.log(`App settings for ${windowId}:`, appSettings);
  const appContent = windower.getAppContent(windowId);
  console.log(`App content for ${windowId}:`, appContent);
  
  const [position, setPosition] = useState(() => ({
    x: Math.floor((window.innerWidth - (windower.getAppSettings(windowId)?.defaultWidth || 600)) / 2),
    y: Math.floor((window.innerHeight - (windower.getAppSettings(windowId)?.defaultHeight || 400)) / 2) 
  }));
  const [size, setSize] = useState({
    width: appSettings?.defaultWidth || 600,
    height: appSettings?.defaultHeight || 400,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { currentWindow, setCurrentWindow } = useCurrentWindow(windower);
  const headerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const preMaximizeState = useRef({ position: position, size: size });

  useEffect(() => {
    windower.registerWindow(
      windowId,
      position.x,
      position.y,
      size.width,
      size.height,
      appSettings?.title || "",
      appSettings?.icon || ""
    );
    return () => {
      windower.unregisterWindow(windowId);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!headerRef.current || isMaximized) return;
    const windowElement = headerRef.current.parentElement as HTMLDivElement;
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;

    setCurrentWindow(windowId);

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      // Constrain to window bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - size.height - 40));

      // Update both visual position and state immediately
      windowElement.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
      setPosition({ x: newX, y: newY });
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
          appSettings?.minWidth || 300,
          Math.min(window.innerWidth - position.x, initialWidth + (e.clientX - startX))
        );
      }
      if (direction === "bottom" || direction === "bottom-right") {
        newHeight = Math.max(
          appSettings?.minHeight || 200,
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
    windower.updateWindowState(
      windowId,
      position.x,
      position.y,
      size.width,
      size.height,
      !isMinimized
    );
  };

  useEffect(() => {
    windower.updateWindowState(windowId, position.x, position.y, size.width, size.height);
  }, [position.x, position.y, size.width, size.height]);

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
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        minWidth: appSettings?.minWidth || 300,
        minHeight: appSettings?.minHeight || 200,
      }}
    >
      <div className="window-header" ref={headerRef} onMouseDown={handleDragStart}>
        <div className="window-header-left">
          <img src={appSettings?.icon} alt="icon" className="window-icon" />
          <span className="window-title">{appSettings?.title}</span>
        </div>
        <div className="window-controls">
          <button className="window-button minimize" onClick={handleMinimize}>─</button>
          <button className="window-button maximize" onClick={handleMaximize}>□</button>
          <button className="window-button close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="window-content">
        {appContent}
      </div>

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
