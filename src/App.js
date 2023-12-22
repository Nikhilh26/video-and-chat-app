import './App.css';
import Lobby from './screen/Lobby';
import { Route, Routes } from 'react-router-dom';
import Room from './screen/Room';

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
