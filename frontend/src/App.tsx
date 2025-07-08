import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { ArtistsPage } from './pages/ArtistsPage';

function App() {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ArtistsPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          {/* Add more routes as we build more pages */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;