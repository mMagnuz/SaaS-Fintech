import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { FinancialSection } from './pages/FinancialSection';
import './App.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/extrato" element={<FinancialSection />} />
        <Route path="/caixinhas" element={<FinancialSection />} />
        <Route path="/emprestimos" element={<FinancialSection />} />
        <Route path="/agendamentos" element={<FinancialSection />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;