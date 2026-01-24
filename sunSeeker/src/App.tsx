import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';


function App() {
return (
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App
