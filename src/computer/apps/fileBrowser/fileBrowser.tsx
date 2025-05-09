import { useEffect, useState } from "react";
import { WebFS } from "../../global/storage/webfs";
import "./fileBrowser.css";

interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
}

export default function FileBrowserApp() {
    const [currentPath, setCurrentPath] = useState("/");
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [fileContent, setFileContent] = useState("");
    const [pathHistory, setPathHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const fs = new WebFS();

    useEffect(() => {
        loadFiles();
    }, [currentPath]);

    const loadFiles = async () => {
        try {
            const fileList = await fs.readdir(currentPath);
            const fileEntries = await Promise.all(
                fileList.map(async (path) => {
                    if (path === currentPath) {
                        return null;
                    }
                    
                    const stats = await fs.stat(path);
                    
                    let name;
                    if (currentPath === '/') {
                        name = path.replace(/^\//, '').split('/')[0];
                    } else {
                        const currentPathWithTrailingSlash = currentPath.endsWith('/') ? currentPath : currentPath + '/';
                        name = path.replace(currentPathWithTrailingSlash, '').split('/')[0];
                    }
                    
                    return {
                        name,
                        path,
                        isDirectory: stats?.isDirectory || false
                    };
                })
            );
            setFiles(fileEntries.filter(entry => entry !== null));
        } catch (error) {
            console.error("Error loading files:", error);
        }
    };

    const handleBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setCurrentPath(pathHistory[newIndex]);
        }
    };

    const handleNavigate = (path: string) => {
        let normalizedPath = path;
        if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }
        
        const newHistory = [...pathHistory.slice(0, historyIndex + 1), normalizedPath];
        setPathHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        
        setCurrentPath(normalizedPath);
        setSelectedFile("");
        setFileContent("");
    };

    const handleCreateFolder = async () => {
        const name = prompt("Enter folder name:");
        if (!name) return;

        try {
            const sanitizedName = name.replace(/\//g, '');
            if (!sanitizedName) return;
            
            let path;
            if (currentPath === "/") {
                path = `/${sanitizedName}`;
            } else {
                path = `${currentPath}/${sanitizedName}`;
            }
            
            await fs.mkdir(path);
            loadFiles();
        } catch (error) {
            console.error("Error creating folder:", error);
        }
    };

    const handleCreateFile = async () => {
        const name = prompt("Enter file name:");
        if (!name) return;

        try {
            const sanitizedName = name.replace(/\//g, '');
            if (!sanitizedName) return;
            
            let path;
            if (currentPath === "/") {
                path = `/${sanitizedName}`;
            } else {
                path = `${currentPath}/${sanitizedName}`;
            }
            
            if (!path.includes('.')) {
                path += '.txt';
            }
            
            await fs.writeFile(path, "");
            loadFiles();
        } catch (error) {
            console.error("Error creating file:", error);
        }
    };

    const handleDeleteFile = async (path: string) => {
        try {
            await fs.unlink(path);
            loadFiles();
            if (selectedFile === path) {
                setSelectedFile("");
                setFileContent("");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleFileClick = async (entry: FileEntry) => {
        if (entry.isDirectory) {
            handleNavigate(entry.path);
        } else {
            handleFileSelect(entry.path);
        }
    };

    const handleFileSelect = async (path: string) => {
        try {
            if (path.endsWith('.txt')) {
                const event = new CustomEvent('open-file-in-app', {
                    detail: {
                        path: path,
                        app: 'notepad'
                    }
                });
                window.dispatchEvent(event);
                
                const windower = window._window;
                if (windower) {
                    windower.openWindow('notepad');
                }
                return;
            }
            
            const content = await fs.readFile(path);
            setSelectedFile(path);
            setFileContent(content);
        } catch (error) {
            console.error("Error reading file:", error);
        }
    };

    const handleSaveFile = async () => {
        if (!selectedFile) return;
        try {
            await fs.writeFile(selectedFile, fileContent);
        } catch (error) {
            console.error("Error saving file:", error);
        }
    };

    const handleRefresh = () => {
        loadFiles();
    };

    return (
        <div className="file-browser-app">
            <div className="file-browser-header">
                <div className="navigation-buttons">
                    <button 
                        className="nav-button"
                        onClick={handleBack}
                        disabled={historyIndex <= 0}
                    >
                        ← Back
                    </button>
                    <button 
                        className="nav-button"
                        onClick={handleRefresh}
                    >
                        🔄 Refresh
                    </button>
                </div>
                <div className="breadcrumb-navigation">
                    <span 
                        className="breadcrumb-item"
                        onClick={() => handleNavigate("/")}
                    >
                        🏠 Root
                    </span>
                    {currentPath !== "/" && (
                        <>
                            {currentPath.split("/").filter(Boolean).map((part, index, arr) => {
                                const pathToHere = "/" + arr.slice(0, index + 1).join("/");
                                return (
                                    <span key={pathToHere} className="breadcrumb-path">
                                        <span className="breadcrumb-separator">/</span>
                                        <span 
                                            className={`breadcrumb-item ${index === arr.length - 1 ? 'current' : ''}`}
                                            onClick={() => handleNavigate(pathToHere)}
                                        >
                                            {part}
                                        </span>
                                    </span>
                                );
                            })}
                        </>
                    )}
                </div>
                <div className="create-buttons">
                    <button 
                        className="nav-button"
                        onClick={handleCreateFile}
                    >
                        📝 New File
                    </button>
                    <button 
                        className="nav-button"
                        onClick={handleCreateFolder}
                    >
                        📁 New Folder
                    </button>
                </div>
            </div>
            
            <div className="file-browser-content">
                <div className="file-list">
                    {files.length > 0 ? (
                        files.map((entry) => (
                            <div key={entry.path} className="file-item">
                                <span 
                                    onClick={() => handleFileClick(entry)}
                                    className={`file-item-name ${entry.path.endsWith('.txt') ? 'text-file' : ''} ${entry.isDirectory ? 'directory' : ''}`}
                                >
                                    {entry.isDirectory ? '📁 ' : entry.path.endsWith('.txt') ? '📝 ' : '📄 '}{entry.name}
                                </span>
                                <div className="file-actions-buttons">
                                    <button onClick={() => handleDeleteFile(entry.path)}>Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-directory-message">
                            This directory is empty. Create a new file or folder to add content.
                        </div>
                    )}
                </div>
            </div>
            
            {selectedFile && !selectedFile.endsWith('.txt') && (
                <div className="file-editor">
                    <h3>Editing: {selectedFile}</h3>
                    <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        rows={10}
                        placeholder="File content will appear here. Note that .txt files will open in the Notepad app instead."
                    />
                    <button onClick={handleSaveFile}>Save</button>
                </div>
            )}
        </div>
    );
}