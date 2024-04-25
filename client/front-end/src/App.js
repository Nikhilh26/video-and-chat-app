import './App.css';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Lobby from './screen/Lobby';
const Room = lazy(() => import('./screen/Room'));

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Lobby />} />
        <Route path='/room/:id' element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
