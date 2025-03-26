
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import SignIn from './pages/SignIn.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import DashboardRoutes from './routes/DashboardRoutes.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path='/login' element={<SignIn />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<DashboardRoutes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
