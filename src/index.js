import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/*
  StrictMode intentionally double-invokes useEffect in development,
  which cancels the preloader's requestAnimationFrame on cleanup before
  the second run, making the animation never start / get stuck at 0%.
  Remove it. (StrictMode has no effect in production builds anyway.)
*/
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);