import './notepad.css';

export function NotepadApp() {
  return (
    <div className="notepad-app">
      <h1>Notepad</h1>
      <textarea placeholder="Type your notes here..."></textarea>
    </div>
  );
}