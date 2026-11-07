import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const usuario = await api.login(email, senha);
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      navigate('/home');
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-top" />
      <div className="auth-glow auth-glow-bottom" />
      <header className="auth-header">
        <Link className="brand" to="/" aria-label="Voltar para a página inicial">
          <BrandMark />
          <span>finora</span>
        </Link>
        <Link className="auth-back" to="/">← Voltar ao início</Link>
      </header>

      <section className="auth-layout">
        <div className="auth-intro">
          <p className="eyebrow"><span className="eyebrow-dot" /> Bom ter você de volta</p>
          <h1>Continue cuidando<br />do que <em>importa.</em></h1>
          <p className="auth-intro-text">
            Acesse sua conta e acompanhe seus planos, suas conquistas e tudo
            que faz seu dinheiro trabalhar por você.
          </p>
          <div className="auth-highlight">
            <span className="highlight-icon">✦</span>
            <span><strong>Seu futuro começa com uma escolha.</strong><small>Estamos aqui para tornar cada passo mais simples.</small></span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-heading">
            <span className="login-icon">↗</span>
            <p className="eyebrow">Área segura</p>
            <h2>Entrar na sua conta</h2>
            <p>Use seus dados para continuar.</p>
          </div>
          {erro && <div className="login-error" role="alert">{erro}</div>}
          <form onSubmit={handleLogin}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <div className="password-label">
              <label htmlFor="senha">Senha</label>
              <button type="button" className="forgot-password">Esqueci minha senha</button>
            </div>
            <input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button className="login-submit" type="submit" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'} <span>↗</span>
            </button>
          </form>
          <p className="login-register">Ainda não tem uma conta? <Link to="/register">Abra sua conta <span>↗</span></Link></p>
          <div className="login-security"><span>▣</span> Seus dados estão protegidos e seguros</div>
        </div>
      </section>
    </main>
  );
}
