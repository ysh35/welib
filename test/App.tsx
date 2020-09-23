import React, { useState } from 'react';
import './App.css';
import useFeche from '../src/slim/rhooks/useFeche/useFeche';

import Feche from '../src/slim/feche';

const feche = Feche.create({ baseURL: 'http://localhost:3000' });

feche.get('/api/person/2');

useFeche.config({ feche: () => Promise.resolve(34) });

function App() {
  const [count, setCount] = useState(0);
  const { data } = useFeche(() => '/api/person/2');

  console.log(data);

  return (
    <div className="App">
      <header className="App-header">
        <p>Hello Vite + React!</p>
        <p>
          <button onClick={() => setCount(count => count + 1)}>sd is: {count}</button>
        </p>
        <p>
          Edit <code>App.jsx</code> and save to test HMR updates.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
