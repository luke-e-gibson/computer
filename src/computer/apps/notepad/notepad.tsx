import { use, useEffect, useState } from 'react';
import './notepad.css';
import { useLocalStorage } from '../../global/storage/localStore';

export function NotepadApp() {
  const [note, setNote] = useState('');
  const [store, setStore] = useLocalStorage<string>('notepad', note);

  useEffect(() => { 
    if (store) {
      setNote(store);
    }
  }, [store]);

  useEffect(() => {
    setStore(note);
  }, [note, setStore]);

  return (
    <div className="notepad-app">
      <textarea placeholder="Type your notes here..." value={note} onChange={(e) => setNote(e.target.value)}></textarea>
    </div>
  );
}