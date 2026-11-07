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

export function Register() {
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', cpf: '', celular: '', dataNascimento: '',
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await api.cadastrarUsuario(formData);
      alert('Conta criada com sucesso! Faça seu login.');
      navigate('/login');
    } catch (err) {
      setErro(err.message || 'Erro ao cadastrar. Verifique os dados.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="auth-page register-page">
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
          <p className="eyebrow"><span className="eyebrow-dot" /> Comece uma nova jornada</p>
          <h1>Seus planos<br />merecem um <em>começo.</em></h1>
          <p className="auth-intro-text">
            Crie sua conta Finora gratuitamente e tenha as ferramentas certas
            para transformar seus objetivos em conquistas.
          </p>
          <div className="auth-benefits">
            <div><span>✓</span><strong>Conta completa e sem burocracia</strong></div>
            <div><span>✓</span><strong>Controle total dos seus planos</strong></div>
            <div><span>✓</span><strong>Segurança em cada movimento</strong></div>
          </div>
        </div>

        <div className="login-card register-card">
          <div className="login-card-heading">
            <span className="login-icon">✦</span>
            <p className="eyebrow">É rápido e gratuito</p>
            <h2>Criar sua conta</h2>
            <p>Preencha seus dados para começar.</p>
          </div>
          {erro && <div className="login-error" role="alert">{erro}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="nome">Nome completo</label>
            <input id="nome" name="nome" placeholder="Como podemos te chamar?" value={formData.nome} onChange={handleChange} autoComplete="name" required />
            <label htmlFor="register-email">E-mail</label>
            <input id="register-email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} autoComplete="email" required />
            <div className="register-fields">
              <div>
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="celular">Celular</label>
                <input id="celular" name="celular" type="tel" placeholder="(00) 00000-0000" value={formData.celular} onChange={handleChange} autoComplete="tel" required />
              </div>
            </div>
            <div className="register-fields register-last-fields">
              <div>
                <label htmlFor="dataNascimento">Data de nascimento</label>
                <input id="dataNascimento" name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required />
              </div>
              <div>
                <label htmlFor="register-senha">Senha</label>
                <input id="register-senha" name="senha" type="password" placeholder="Crie uma senha" value={formData.senha} onChange={handleChange} autoComplete="new-password" required />
              </div>
            </div>
            <button className="login-submit" type="submit" disabled={carregando}>
              {carregando ? 'Criando conta...' : 'Criar minha conta'} <span>↗</span>
            </button>
          </form>
          <p className="login-register">Já tem uma conta? <Link to="/login">Entrar agora <span>↗</span></Link></p>
          <div className="login-security"><span>▣</span> Seus dados estão protegidos e seguros</div>
        </div>
      </section>
    </main>
  );
}
