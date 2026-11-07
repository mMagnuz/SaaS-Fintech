import { Link } from 'react-router-dom';

const features = [
  {
    icon: '↗',
    title: 'Controle em um só lugar',
    text: 'Tenha uma visão clara do seu dinheiro, gastos e objetivos em tempo real.',
  },
  {
    icon: '◌',
    title: 'Planeje com tranquilidade',
    text: 'Crie reservas para seus planos e acompanhe cada conquista de perto.',
  },
  {
    icon: '✓',
    title: 'Feito para sua rotina',
    text: 'Uma experiência simples, segura e sem complicação para você evoluir.',
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function PhonePreview() {
  return (
    <div className="phone-wrap" aria-label="Prévia do aplicativo Finora">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-status">
          <span>09:41</span>
          <span>••• ◔</span>
        </div>
        <div className="phone-header">
          <span className="mini-brand"><BrandMark /> Finora</span>
          <span className="phone-actions">⌕ &nbsp;◯</span>
        </div>
        <p className="phone-label">Saldo disponível</p>
        <strong className="phone-balance">R$ 12.480,90</strong>
        <span className="phone-change">↑ 8,4% este mês</span>
        <div className="phone-actions-row">
          <button type="button">＋ Depositar</button>
          <button type="button">↗ Transferir</button>
        </div>
        <div className="phone-section-title">
          <strong>Movimentações</strong>
          <span>Ver tudo</span>
        </div>
        <div className="phone-transaction">
          <span className="transaction-icon purple">◈</span>
          <span><strong>Pagamento recebido</strong><small>Hoje, 14:32</small></span>
          <b className="positive">+ R$ 850,00</b>
        </div>
        <div className="phone-transaction">
          <span className="transaction-icon yellow">▦</span>
          <span><strong>Supermercado</strong><small>Ontem, 18:20</small></span>
          <b>- R$ 124,90</b>
        </div>
        <div className="phone-transaction">
          <span className="transaction-icon green">◉</span>
          <span><strong>Reserva mensal</strong><small>12 de maio</small></span>
          <b>- R$ 300,00</b>
        </div>
      </div>
    </div>
  );
}

export function Welcome() {
  return (
    <main className="welcome-page">
      <section className="hero-section">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />
        <nav className="welcome-nav">
          <Link className="brand" to="/" aria-label="Finora início">
            <BrandMark />
            <span>finora</span>
          </Link>
          <div className="nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#sobre">Sobre nós</a>
            <a href="#seguranca">Segurança</a>
          </div>
          <Link className="nav-login" to="/login">Entrar <span>↗</span></Link>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Simples para você. Completo para seus planos.</p>
          <h1>Seu dinheiro,<br /><em>do seu jeito.</em></h1>
          <p className="hero-description">
            Uma conta digital inteligente para cuidar da sua vida financeira
            com mais liberdade, clareza e tranquilidade.
          </p>
          <div className="hero-cta">
            <Link className="button button-primary" to="/register">Abra sua conta <span>↗</span></Link>
            <a className="button button-ghost" href="#recursos">Conheça a Finora <span>↓</span></a>
          </div>
          <div className="hero-trust"><span className="avatar-stack"><i /><i /><i /></span><span>Junte-se a mais de <strong>12 mil</strong> pessoas</span></div>
        </div>

        <div className="hero-product">
          <div className="floating-card floating-balance">
            <span className="float-icon">↗</span>
            <small>Seu saldo cresceu</small>
            <strong>+ R$ 2.450,00</strong>
            <span className="float-period">este mês</span>
          </div>
          <PhonePreview />
          <div className="floating-card floating-goal">
            <span className="goal-top"><span className="float-icon">◎</span> Viagem</span>
            <strong>R$ 3.840</strong>
            <div className="goal-progress"><span /></div>
            <small>76% do objetivo</small>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div><strong>R$ 8,5 mi</strong><span>movimentados com segurança</span></div>
        <div><strong>12 mil<span>+</span></strong><span>clientes que confiam</span></div>
        <div><strong>4,9 <span className="star">★</span></strong><span>avaliação na sua loja</span></div>
        <div className="stats-invite"><span>Comece hoje a transformar seus planos</span><Link to="/register">Criar minha conta <span>↗</span></Link></div>
      </section>

      <section className="features-section" id="recursos">
        <div className="section-heading">
          <p className="eyebrow"><span className="eyebrow-dot" /> Tudo que você precisa</p>
          <h2>Mais que uma conta.<br /><em>Um novo jeito de viver.</em></h2>
          <p>Ferramentas pensadas para deixar suas escolhas mais leves e seus planos mais possíveis.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="security-banner" id="seguranca">
        <div className="security-symbol">✦</div>
        <div><p className="eyebrow">Segurança em primeiro lugar</p><h2>Seu dinheiro protegido,<br /><em>sempre.</em></h2></div>
        <p className="security-text">Tecnologia e cuidado para que você possa focar no que realmente importa: seus próximos passos.</p>
        <Link className="text-link" to="/register">Quero fazer parte <span>↗</span></Link>
      </section>

      <footer id="sobre">
        <Link className="brand" to="/"><BrandMark /><span>finora</span></Link>
        <span>© 2025 Finora. Feito para a sua vida.</span>
        <div><a href="#recursos">Recursos</a><a href="#seguranca">Segurança</a><Link to="/login">Entrar</Link></div>
      </footer>
    </main>
  );
}
