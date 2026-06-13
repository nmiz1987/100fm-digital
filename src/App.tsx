import { Routes, Route } from 'react-router-dom';
import { useMediaSession } from './hooks/useMediaSession';
import { NotFound } from './Screens/NotFound';
import { CarApp } from './Screens/CarApp';
import { Main } from './Screens/Main';

export default function App() {
  useMediaSession();

  return (
    <Routes>
      <Route path="/car" element={<CarApp />} />
      <Route path="/car/:slug" element={<CarApp />} />
      <Route path="/" element={<Main />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
