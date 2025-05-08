import { use, useContext, useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import "./style/Window.css";
import { useCurrentWindow } from "./global/windowing";
import { WindowingContext } from "./global/global";

interface WindowProps {
  children: React.ReactNode;
  window: {
    minWidth: number;
    minHeight: number;
    id: string | null; // Optional, generate new id if not provided
    title: string;
    icon: string;
  };
}

const RESIZE_HANDLE_SIZE = 5;

export function Window({ children, window: windowSettings }: WindowProps) {  
  const [windowId] = useState(windowSettings.id || nanoid());
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({
    width: windowSettings.minWidth,
    height: windowSettings.minHeight,
  });
  const windower = useContext(WindowingContext);
  const {currentWindow, setCurrentWindow} = useCurrentWindow(windower);  
  const headerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);


  //Only call once when the component mounts
  useEffect(() => {
    if(mounted) return;
    setMounted(true);
    console.log("Window mounted");
    windower.registerWindow(windowId, position.x, position.y, size.width, size.height);

    return () => {
      console.log("Window unmounted");
      windower.unregisterWindow(windowSettings.id || nanoid());
    };
  }, [windowSettings.id, position.x, position.y, size.width, size.height])

  useEffect(() => {
    if (!headerRef.current || !windowRef.current) return;
    const headerElement = headerRef.current;
    const windowElement = windowRef.current;

    windowElement.onclick = (e) => {
      e.stopPropagation();
      if (currentWindow !== windowId) {
        setCurrentWindow(windowId);
      }
    }
    
    headerElement.onmousedown = (e) => {
      const windowElement = headerElement.parentElement as HTMLDivElement;
      const offsetX = e.clientX - windowElement.getBoundingClientRect().left;
      const offsetY = e.clientY - windowElement.getBoundingClientRect().top;

      setCurrentWindow(windowId);

      const mouseMoveHandler = (e: MouseEvent) => {
        requestAnimationFrame(() => {
          let newX = e.clientX - offsetX;
          let newY = e.clientY - offsetY;

          // Keep window within screen bounds
          newX = Math.max(0, Math.min(newX, window.innerWidth - windowElement.offsetWidth));
          newY = Math.max(0, Math.min(newY, window.innerHeight - windowElement.offsetHeight));
          setPosition({ x: newX, y: newY });
        });
      };

      const mouseUpHandler = () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
      };

      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", mouseUpHandler);
    };

    const handleResizeMouseDown = (
      e: MouseEvent,
      direction: "right" | "bottom" | "bottom-right"
    ) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const initialWidth = windowElement.offsetWidth;
      const initialHeight = windowElement.offsetHeight;

      const mouseMoveHandler = (e: MouseEvent) => {
        let newWidth = initialWidth;
        let newHeight = initialHeight;

        if (direction === "right" || direction === "bottom-right") {
          newWidth = Math.max(
            windowSettings.minWidth,
            initialWidth + (e.clientX - startX)
          );
        }
        if (direction === "bottom" || direction === "bottom-right") {
          newHeight = Math.max(
            windowSettings.minHeight,
            initialHeight + (e.clientY - startY)
          );
        }

        setSize({ width: newWidth, height: newHeight });
      };

      const mouseUpHandler = () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
      };

      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", mouseUpHandler);
    };

    const rightResizeHandle = document.createElement("div");
    rightResizeHandle.className = "resize-handle resize-right";
    rightResizeHandle.style.width = `${RESIZE_HANDLE_SIZE}px`;
    rightResizeHandle.style.position = "absolute";
    rightResizeHandle.style.top = "0";
    rightResizeHandle.style.right = "0";
    rightResizeHandle.style.height = "100%";
    rightResizeHandle.style.cursor = "ew-resize";
    rightResizeHandle.addEventListener("mousedown", (e) =>
      handleResizeMouseDown(e, "right")
    );
    windowElement.appendChild(rightResizeHandle);

    const bottomResizeHandle = document.createElement("div");
    bottomResizeHandle.className = "resize-handle resize-bottom";
    bottomResizeHandle.style.height = `${RESIZE_HANDLE_SIZE}px`;
    bottomResizeHandle.style.position = "absolute";
    bottomResizeHandle.style.bottom = "0";
    bottomResizeHandle.style.left = "0";
    bottomResizeHandle.style.width = "100%";
    bottomResizeHandle.style.cursor = "ns-resize";
    bottomResizeHandle.addEventListener("mousedown", (e) =>
      handleResizeMouseDown(e, "bottom")
    );
    windowElement.appendChild(bottomResizeHandle);

    const bottomRightResizeHandle = document.createElement("div");
    bottomRightResizeHandle.className = "resize-handle resize-bottom-right";
    bottomRightResizeHandle.style.width = `${RESIZE_HANDLE_SIZE}px`;
    bottomRightResizeHandle.style.height = `${RESIZE_HANDLE_SIZE}px`;
    bottomRightResizeHandle.style.position = "absolute";
    bottomRightResizeHandle.style.bottom = "0";
    bottomRightResizeHandle.style.right = "0";
    bottomRightResizeHandle.style.cursor = "nwse-resize";
    bottomRightResizeHandle.addEventListener("mousedown", (e) =>
      handleResizeMouseDown(e, "bottom-right")
    );
    windowElement.appendChild(bottomRightResizeHandle);

    return () => {
      rightResizeHandle.removeEventListener("mousedown", (e) =>
        handleResizeMouseDown(e, "right")
      );
      bottomResizeHandle.removeEventListener("mousedown", (e) =>
        handleResizeMouseDown(e, "bottom")
      );
      bottomRightResizeHandle.removeEventListener("mousedown", (e) =>
        handleResizeMouseDown(e, "bottom-right")
      );
    };
  }, [windowSettings.minWidth, windowSettings.minHeight]);

  return (
    <div
      className="window"
      ref={windowRef}
      onClick={(e) => {
        e.stopPropagation();
        if (currentWindow !== windowId) {
          setCurrentWindow(windowId);
        }
      }}
      style={{
        zIndex: currentWindow === windowId ? 1 : 0,
        width: `${size.width}px`,
        height: `${size.height}px`,
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: windowSettings.minWidth,
        minHeight: windowSettings.minHeight,
      }}
    >
      <div className="window-header" ref={headerRef}>
        <div>
          <img src={windowSettings.icon} alt="icon" className="window-icon" />
          <span className="window-title">{windowSettings.title}</span>
        </div>

        <div className="window-controls">
          <button className="window-button">-</button>
          <button className="window-button">+</button>
          <button className="window-button">x</button>
        </div>
      </div>

      <div className="window-content">{children}</div>
    </div>
  );
}
