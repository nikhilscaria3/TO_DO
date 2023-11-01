import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Correct the file path if necessary

import TODO from './components/TODO';


function App() {
  return (
    <BrowserRouter>
      <Routes>

       
        <Route path="/" element={<TODO />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
