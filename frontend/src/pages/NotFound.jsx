import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>404 - Página Não Encontrada</h1>
      <p>A página que você está procurando não existe ou foi movida.</p>
      <Link to="/login">Voltar para o Login</Link>
    </div>
  );
}