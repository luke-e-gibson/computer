import { useEffect, useState } from 'react';
import './notepad.css';
import { useLocalStorage } from '../../global/storage/localStore';
import { WebFS } from '../../global/storage/webfs';

export function NotepadApp() {
  const [note, setNote] = useState('');
  const [store, setStore] = useLocalStorage<string>('notepad', note);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [filename, setFilename] = useState('');
  const [fileList, setFileList] = useState<string[]>([]);
  const fs = new WebFS();

  useEffect(() => { 
    if (store) {
      setNote(store);
    } 

    // Add event listener for file opening
    const handleOpenFile = async (event: CustomEvent<{ path: string, app: string }>) => {
      try {
        // Only handle events targeted for the notepad app
        if (event.detail.app && event.detail.app !== 'notepad') {
          return;
        }
        
        const content = await fs.readFile(event.detail.path);
        setNote(content);
        setCurrentFile(event.detail.path);
        
        // Update window title with filename
        const filename = event.detail.path.split('/').pop() || 'Untitled';
        const windower = window._window;
        const currentWindowId = windower?.getCurrentWindow();
        if (currentWindowId && currentWindowId.startsWith('notepad-')) {
          const windows = windower.getWindows();
          const window = windows[currentWindowId];
          if (window) {
            window.title = `Notepad - ${filename}`;
            windower.notifyListeners();
          }
        }
      } catch (error) {
        console.error('Error opening file:', error);
      }
    };

    window.addEventListener('open-file-in-app' as any, handleOpenFile as any);

    return () => {
      window.removeEventListener('open-file-in-app' as any, handleOpenFile as any);
    };
  }, [store]);

  useEffect(() => {
    setStore(note);
  }, [note, setStore]);

  const loadFileList = async () => {
    try {
      // Load files from all directories recursively to find all text files
      const allTxtFiles: string[] = [];
      
      // Helper function to recursively scan directories
      const scanDirectory = async (path: string) => {
        try {
          const files = await fs.readdir(path);
          
          for (const file of files) {
            // Skip the directory entry itself to avoid infinite loops
            if (file === path) continue;
            
            try {
              const stats = await fs.stat(file);
              
              if (stats?.isDirectory) {
                // Recursively scan subdirectories
                await scanDirectory(file);
              } else if (file.endsWith('.txt')) {
                // Add text files to our list
                allTxtFiles.push(file);
              }
            } catch (error) {
              // Skip errors for individual files
              console.log(`Error accessing file ${file}:`, error);
            }
          }
        } catch (error) {
          console.log(`Error reading directory ${path}:`, error);
        }
      };
      
      // Start scanning from root
      await scanDirectory('/');
      
      // Sort files for better organization
      allTxtFiles.sort();
      setFileList(allTxtFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleSave = async () => {
    if (currentFile) {
      await fs.writeFile(currentFile, note);
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    if (!filename) return;
    
    try {
      // Add .txt extension if not provided
      let adjustedFilename = filename;
      if (!adjustedFilename.toLowerCase().endsWith('.txt')) {
        adjustedFilename += '.txt';
      }
      
      const filePath = `/${adjustedFilename}`;
      await fs.writeFile(filePath, note);
      setCurrentFile(filePath);
      setShowSaveDialog(false);
      setFilename('');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleOpen = async () => {
    await loadFileList();
    setShowOpenDialog(true);
  };

  const handleFileSelect = async (filePath: string) => {
    try {
      const content = await fs.readFile(filePath);
      setNote(content);
      setCurrentFile(filePath);
      setShowOpenDialog(false);
      
      // Update window title with filename
      const filename = filePath.split('/').pop() || 'Untitled';
      const windower = window._window;
      const currentWindowId = windower?.getCurrentWindow();
      if (currentWindowId && currentWindowId.startsWith('notepad-')) {
        const windows = windower.getWindows();
        const window = windows[currentWindowId];
        if (window) {
          window.title = `Notepad - ${filename}`;
          windower.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  return (
    <div className="notepad-app">
      <div className="notepad-toolbar">
        <button onClick={handleOpen}>Open</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleSaveAs}>Save As</button>
        {currentFile && <span className="current-file">Current file: {currentFile.replace(/^\//, '')}</span>}
      </div>
      <textarea 
        placeholder="Type your notes here..." 
        value={note} 
        onChange={(e) => setNote(e.target.value)}
      ></textarea>

      {showSaveDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Save File</h3>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
            />
            <div className="dialog-buttons">
              <button onClick={handleSaveConfirm}>Save</button>
              <button onClick={() => {
                setShowSaveDialog(false);
                setFilename('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>Open File</h3>
            <div className="file-list">
              {fileList.length > 0 ? (
                <div className="file-list-container">
                  {fileList.map((file) => {
                    // Group files by directory for better organization
                    const pathParts = file.split('/').filter(Boolean);
                    const fileName = pathParts.pop() || '';
                    const directory = pathParts.length > 0 ? `/${pathParts.join('/')}` : 'Root';
                    
                    return (
                      <div 
                        key={file}
                        className="file-item"
                        onClick={() => handleFileSelect(file)}
                      >
                        <span className="file-icon">📝</span>
                        <div className="file-details">
                          <span className="file-name">{fileName}</span>
                          <span className="file-directory">{directory}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-files">No .txt files found</div>
              )}
            </div>
            <div className="dialog-buttons">
              {fileList.length > 0 && <button onClick={() => loadFileList()}>Refresh</button>}
              <button onClick={() => setShowOpenDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}