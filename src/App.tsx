import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import PhotoSplicer from './components/PhotoSplicer';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <PhotoSplicer />
      </div>
    </ThemeProvider>
  );
}

export default App;
