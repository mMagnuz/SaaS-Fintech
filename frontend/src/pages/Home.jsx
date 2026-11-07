import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const todayLabel = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date());

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(options?.headers || {}) },
    });
  } catch {
    throw new Error('Não foi possível conectar ao backend. Verifique se a API está em execução e se a origem do frontend está liberada.');
  }
  const contentType = response.headers.get('content-type') || '';
  const responseText = await response.text();
  let body = null;

  if (responseText) {
    if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(responseText);
      } catch {
        body = null;
      }
    } else {
      body = responseText;
    }
  }

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';
    if (body && typeof body === 'object') {
      message = body.message || body.mensagem || body.error || message;
    } else if (typeof body === 'string' && body.trim()) {
      message = body;
    }
    throw new Error(message);
  }

  return response.status === 204 || !responseText ? null : body;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /></span>;
}

function formatValue(value) {
  return currency.format(Number(value || 0));
}

function transactionLabel(transaction, incoming) {
  if (transaction.tipo === 'DEPOSITO') {
    return transaction.nomeRemetente ? `Depósito recebido de ${transaction.nomeRemetente}` : 'Depósito recebido';
  }
  if (transaction.tipo === 'EMPRESTIMO_CONCEDIDO') return 'Empréstimo liberado';
  if (transaction.tipo === 'COMPRA_CARTAO') return 'Compra no cartão';
  if (transaction.tipo === 'PAGAMENTO_FATURA') return 'Pagamento de fatura';
  if (transaction.tipo === 'PAGAMENTO_EMPRESTIMO') return 'Pagamento de empréstimo';
  if (transaction.tipo === 'TRANSFERENCIA' || transaction.tipo === 'TRANSFERENCIA_AGENDADA') {
    if (incoming) {
      return transaction.nomeRemetente
        ? `${transaction.tipo === 'TRANSFERENCIA_AGENDADA' ? 'Transferência agendada recebida de' : 'Transferência recebida de'} ${transaction.nomeRemetente}`
        : 'Transferência recebida';
    }
    return transaction.nomeDestinatario
      ? `${transaction.tipo === 'TRANSFERENCIA_AGENDADA' ? 'Transferência agendada enviada para' : 'Transferência enviada para'} ${transaction.nomeDestinatario}`
      : 'Transferência enviada';
  }
  return transaction.tipo || 'Movimentação';
}

function transactionIcon(type) {
  if (type === 'DEPOSITO') return '↓';
  if (type === 'TRANSFERENCIA') return '↗';
  if (type === 'EMPRESTIMO_CONCEDIDO') return '＋';
  return '◈';
}

function initialAction() {
  return {
    type: '', amount: '', target: '', name: '', meta: '', months: '12', rate: '0.02',
    date: '', product: '', installments: '1', caixinhaId: '',
  };
}

export function Home() {
  const [usuario, setUsuario] = useState(null);
  const [conta, setConta] = useState(null);
  const [extrato, setExtrato] = useState([]);
  const [caixinhas, setCaixinhas] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [action, setAction] = useState(initialAction);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [goalTargets, setGoalTargets] = useState({});
  const [featuredGoalId, setFeaturedGoalId] = useState(null);
  const navigate = useNavigate();

  const carregarDados = useCallback(async (idUsuario) => {
    setLoading(true);
    try {
      const contas = await request(`/conta/usuario/${idUsuario}`);
      if (!contas.length) throw new Error('Nenhuma conta foi encontrada para este usuário.');
      const contaAtual = contas[0];
      const [extratoAtual, caixinhasAtuais, emprestimosAtuais, agendamentosAtuais] = await Promise.all([
        request(`/conta/${contaAtual.idConta}/extrato`),
        request(`/caixinhas/lista/${contaAtual.idConta}`),
        request(`/emprestimos/conta/${contaAtual.idConta}`),
        request(`/agendamentos/conta/${contaAtual.idConta}`),
      ]);
      setConta(contaAtual);
      setExtrato(extratoAtual || []);
      setCaixinhas(caixinhasAtuais || []);
      setEmprestimos(emprestimosAtuais || []);
      setAgendamentos(agendamentosAtuais || []);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuarioLogado');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      setUsuario(parsedUser);
      setGoalTargets(JSON.parse(localStorage.getItem(`finora-meta-${parsedUser.id}`) || '{}'));
      setFeaturedGoalId(localStorage.getItem(`finora-destaque-${parsedUser.id}`));
      carregarDados(parsedUser.id);
    } catch {
      localStorage.removeItem('usuarioLogado');
      navigate('/login');
    }
  }, [carregarDados, navigate]);

  const featuredGoal = caixinhas.find((item) => String(item.idCaixinha) === String(featuredGoalId)) || caixinhas[0];
  const featuredAmount = Number(featuredGoal?.valorGuardado || 0);
  const goalTarget = Number(goalTargets[featuredGoal?.nome] || featuredGoal?.meta || 5000);
  const goalProgress = Math.min(100, Math.round((featuredAmount / goalTarget) * 100));
  const activeLoans = emprestimos.filter((item) => item.status === 'ATIVO');
  const pendingSchedules = agendamentos.filter((item) => item.status === 'PENDENTE');

  const openAction = (type) => {
    setFeedback({ type: '', message: '' });
    setRecipient(null);
    setAction({ ...initialAction(), type });
  };

  const setFeaturedGoal = (idCaixinha) => {
    setFeaturedGoalId(String(idCaixinha));
    localStorage.setItem(`finora-destaque-${usuario.id}`, String(idCaixinha));
    setFeedback({ type: 'success', message: 'Caixinha definida como destaque.' });
  };

  const deleteEmptyGoal = async (caixinha) => {
    if (Number(caixinha.valorGuardado || 0) !== 0) {
      setFeedback({ type: 'error', message: 'Só é possível excluir uma caixinha vazia.' });
      return;
    }
    try {
      await request(`/caixinhas/${caixinha.idCaixinha}?idConta=${conta.idConta}`, { method: 'DELETE' });
      if (String(featuredGoalId) === String(caixinha.idCaixinha)) {
        setFeaturedGoalId(null);
        localStorage.removeItem(`finora-destaque-${usuario.id}`);
      }
      setFeedback({ type: 'success', message: 'Caixinha excluída com sucesso.' });
      await carregarDados(usuario.id);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  const payLoan = async (loan) => {
    try {
      await request(`/emprestimos/${loan.idEmprestimo}/pagar?idConta=${conta.idConta}`, { method: 'POST' });
      setFeedback({ type: 'success', message: 'Empréstimo quitado com sucesso.' });
      await carregarDados(usuario.id);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  const findRecipient = async () => {
    if (!action.target.trim()) {
      setFeedback({ type: 'error', message: 'Informe nome, celular, CPF ou número da conta.' });
      return;
    }
    setRecipientLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const found = await request(`/usuario/destinatario?identificador=${encodeURIComponent(action.target.trim())}`);
      if (found.idConta === conta.idConta) throw new Error('A conta de destino precisa ser diferente da sua.');
      setRecipient(found);
    } catch (error) {
      setRecipient(null);
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setRecipientLoading(false);
    }
  };

  const requestTransfer = async (event) => {
    event.preventDefault();
    if (!recipient) {
      await findRecipient();
      return;
    }
    const amount = Number(action.amount);
    if (!amount || amount <= 0) {
      setFeedback({ type: 'error', message: 'Informe um valor maior que zero.' });
      return;
    }
    setPendingTransfer({ recipient, amount });
  };

  const handleAction = async (event) => {
    event.preventDefault();
    const { type, amount, target, name, meta, months, rate, date, product, installments } = action;
    const numericAmount = Number(amount);
    const actionsWithoutAmount = ['pay-invoice'];
    if (!actionsWithoutAmount.includes(type) && (!numericAmount || numericAmount <= 0)) {
      setFeedback({ type: 'error', message: 'Informe um valor maior que zero.' });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      if (type === 'deposit') {
        await request('/conta/depositar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idConta: conta.idConta, valor: numericAmount }),
        });
      } else if (type === 'transfer') {
        if (!target || !recipient) throw new Error('Encontre e confirme o destinatário antes de continuar.');
        await request('/conta/transferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idContaOrigem: conta.idConta, idContaDestino: recipient.idConta, valor: numericAmount }),
        });
      } else if (type === 'goal') {
        if (!name.trim()) throw new Error('Informe um nome para a caixinha.');
        if (meta && Number(meta) <= 0) throw new Error('A meta deve ser maior que zero.');
        await request('/caixinhas/guardar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idConta: conta.idConta, nome: name.trim(), valor: numericAmount, meta: meta ? Number(meta) : null }),
        });
      } else if (type === 'withdraw') {
        if (!action.caixinhaId) throw new Error('Selecione uma caixinha para resgatar.');
        await request(`/caixinhas/${action.caixinhaId}/resgatar?valor=${numericAmount}`, { method: 'POST' });
      } else if (type === 'loan') {
        await request('/emprestimos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idConta: conta.idConta,
            valorSolicitado: numericAmount,
            taxaJuros: Number(rate),
            quantidadeMeses: Number(months),
            mesesCarencia: 0,
          }),
        });
      } else if (type === 'scheduled') {
        if (!target || !recipient || !date) throw new Error('Encontre o destinatário e informe a data do agendamento.');
        await request('/agendamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idContaOrigem: conta.idConta,
            idContaDestino: recipient.idConta,
            valor: numericAmount,
            dataHoraAgendada: date,
          }),
        });
      } else if (type === 'purchase') {
        if (!product.trim()) throw new Error('Informe o produto da compra.');
        await request('/conta/compra-parcelada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idConta: conta.idConta,
            descricao: product.trim(),
            valor: numericAmount,
            parcelas: Number(installments),
          }),
        });
      } else if (type === 'pay-invoice') {
        await request(`/conta/${conta.idConta}/pagar-fatura`, { method: 'POST' });
      }
      setAction(initialAction());
      setRecipient(null);
      if (type === 'goal' && meta) {
        const nextTargets = { ...goalTargets, [name.trim()]: Number(meta) };
        setGoalTargets(nextTargets);
        localStorage.setItem(`finora-meta-${usuario.id}`, JSON.stringify(nextTargets));
      }
      setFeedback({ type: 'success', message: 'Operação realizada com sucesso.' });
      await carregarDados(usuario.id);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    navigate('/login');
  };

  const confirmTransfer = async () => {
    setPendingTransfer(null);
    await handleAction({ preventDefault: () => {} });
  };

  const loanPreview = action.type === 'loan' && Number(action.amount) > 0
    ? Number(action.amount) * ((1 + Number(action.rate || 0)) ** Number(action.months || 1))
    : 0;

  if (loading && !conta) {
    return <div className="dashboard-loading"><BrandMark /><p>Preparando seu espaço financeiro...</p></div>;
  }
  if (!conta || !usuario) {
    return <div className="dashboard-loading"><p>{feedback.message || 'Não foi possível carregar sua conta.'}</p><button className="dashboard-button" onClick={() => navigate('/login')}>Voltar ao login</button></div>;
  }

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div>
          <a className="brand dashboard-brand" href="#inicio"><BrandMark /><span>finora</span></a>
          <p className="sidebar-label">MENU PRINCIPAL</p>
          <nav className="dashboard-nav">
            <a className="active" href="/home"><span>⌂</span> Visão geral</a>
            <a href="/extrato"><span>↕</span> Extrato</a>
            <a href="/caixinhas"><span>◉</span> Caixinhas</a>
            <a href="/emprestimos"><span>＋</span> Empréstimos</a>
            <a href="/agendamentos"><span>◷</span> Agendamentos</a>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="support-card"><span>✦</span><strong>Precisa de ajuda?</strong><small>Fale com nosso suporte</small></div>
          <button className="logout-button" onClick={handleLogout}><span>↪</span> Sair da conta</button>
        </div>
      </aside>

      <section className="dashboard-content" id="inicio">
        <header className="dashboard-header">
          <div><p className="dashboard-date">{todayLabel}</p><h1>Olá, {usuario.nome?.split(' ')[0] || 'pessoa'} <span>✦</span></h1><p className="dashboard-subtitle">Aqui está um resumo do seu dinheiro hoje.</p></div>
          <div className="dashboard-user"><button className="notification-button" aria-label="Notificações">♢<i /></button><span className="user-avatar">{usuario.nome?.charAt(0).toUpperCase() || 'U'}</span><div><strong>{usuario.nome}</strong><small>Conta pessoal</small></div><span className="user-chevron">⌄</span></div>
        </header>

        {feedback.message && <div className={`dashboard-feedback ${feedback.type}`} role="alert">{feedback.message}<button onClick={() => setFeedback({ type: '', message: '' })}>×</button></div>}

        <div className="dashboard-grid">
          <section className="balance-card">
            <div className="card-overline"><span>Saldo disponível</span><button aria-label="Ocultar saldo">◉</button></div>
            <strong className="balance-value">{formatValue(conta.saldo)}</strong>
            <p className="balance-change"><span>↗</span> Saldo atualizado agora</p>
            <div className="balance-footer"><span>Conta nº {conta.idConta}</span><span>Limite: {formatValue(conta.limiteCredito)}</span></div>
          </section>
          <section className="goal-card" id="caixinhas">
            <div className="card-overline"><span><span className="goal-icon">◎</span> Meta em destaque</span><span className="goal-percent">{goalProgress}%</span></div>
            <h2>{caixinhas[0]?.nome || 'Minha próxima conquista'}</h2>
            <p className="goal-amount">{formatValue(featuredAmount)} <small>de {formatValue(goalTarget)}</small></p>
            <div className="goal-bar"><span style={{ width: `${goalProgress}%` }} /></div>
            <p className="goal-caption">{goalProgress >= 100 ? 'Meta alcançada! Parabéns.' : `Faltam ${formatValue(Math.max(0, goalTarget - featuredAmount))} para sua meta`}</p>
          </section>
        </div>

        <div className="quick-actions">
          <button onClick={() => openAction('deposit')}><span className="action-icon green">＋</span><span><strong>Depositar</strong><small>Adicionar saldo</small></span><b>↗</b></button>
          <button onClick={() => openAction('transfer')}><span className="action-icon purple">↗</span><span><strong>Transferir</strong><small>Enviar dinheiro</small></span><b>↗</b></button>
          <button onClick={() => openAction('goal')}><span className="action-icon yellow">◎</span><span><strong>Guardar</strong><small>Criar caixinha</small></span><b>↗</b></button>
          <button onClick={() => openAction('loan')}><span className="action-icon blue">▣</span><span><strong>Empréstimo</strong><small>Simular agora</small></span><b>↗</b></button>
          <button onClick={() => openAction('scheduled')}><span className="action-icon purple">◷</span><span><strong>Agendar</strong><small>Programar envio</small></span><b>↗</b></button>
          <button onClick={() => openAction('purchase')}><span className="action-icon yellow">▤</span><span><strong>Comprar</strong><small>Parcelar no cartão</small></span><b>↗</b></button>
          <button onClick={() => openAction('pay-invoice')}><span className="action-icon green">✓</span><span><strong>Pagar fatura</strong><small>{formatValue(conta.fatura)} em aberto</small></span><b>↗</b></button>
        </div>

        {action.type && <section className="dashboard-action-panel">
          <div className="action-panel-heading"><div><p className="eyebrow">Operação financeira</p><h2>{action.type === 'deposit' ? 'Adicionar saldo' : action.type === 'transfer' ? 'Fazer transferência' : action.type === 'scheduled' ? 'Agendar transferência' : action.type === 'goal' ? 'Guardar em uma caixinha' : action.type === 'withdraw' ? 'Resgatar da caixinha' : action.type === 'purchase' ? 'Simular compra parcelada' : action.type === 'pay-invoice' ? 'Pagar fatura do cartão' : 'Solicitar empréstimo'}</h2></div><button onClick={() => { setAction(initialAction()); setRecipient(null); }}>×</button></div>
          {action.type === 'pay-invoice' ? <div className="invoice-confirm"><p>Sua fatura atual está em <strong>{formatValue(conta.fatura)}</strong>. O pagamento será descontado do saldo disponível.</p><button className="dashboard-button" onClick={handleAction} disabled={submitting || Number(conta.fatura) <= 0}>{submitting ? 'Processando...' : 'Confirmar pagamento'} <span>↗</span></button></div> : <form onSubmit={action.type === 'transfer' || action.type === 'scheduled' ? requestTransfer : handleAction}>
            {(action.type === 'transfer' || action.type === 'scheduled') && <div className="recipient-search"><label>Destinatário<input type="text" value={action.target} onChange={(e) => { setAction({ ...action, target: e.target.value }); setRecipient(null); }} placeholder="Nome, celular, CPF ou nº da conta" required /></label><button type="button" className="dashboard-button secondary-button" onClick={findRecipient} disabled={recipientLoading}>{recipientLoading ? 'Buscando...' : 'Encontrar'}</button></div>}
            {recipient && <div className="recipient-card"><span className="user-avatar">{recipient.nome.charAt(0).toUpperCase()}</span><div><strong>{recipient.nome}</strong><small>Conta nº {recipient.idConta} · CPF {recipient.cpf || 'não informado'}</small></div><span className="recipient-ok">✓ encontrado</span></div>}
            {action.type === 'goal' && <><label>Nome da caixinha<input value={action.name} onChange={(e) => setAction({ ...action, name: e.target.value })} placeholder="Ex.: Viagem, reserva..." required /></label><label>Meta (opcional)<input type="number" min="0.01" step="0.01" value={action.meta} onChange={(e) => setAction({ ...action, meta: e.target.value })} placeholder="Ex.: 5.000,00" /></label></>}
            {action.type === 'withdraw' && <label>Caixinha<select value={action.caixinhaId} onChange={(e) => setAction({ ...action, caixinhaId: e.target.value })} required><option value="">Selecione uma caixinha</option>{caixinhas.map((item) => <option key={item.idCaixinha} value={item.idCaixinha}>{item.nome} · {formatValue(item.valorGuardado)}</option>)}</select></label>}
            {action.type === 'purchase' && <label>Produto ou serviço<input value={action.product} onChange={(e) => setAction({ ...action, product: e.target.value })} placeholder="Ex.: Notebook" required /></label>}
            {(action.type === 'deposit' || action.type === 'goal' || action.type === 'purchase') && <label>Valor<input type="number" min="0.01" step="0.01" value={action.amount} onChange={(e) => setAction({ ...action, amount: e.target.value })} placeholder="R$ 0,00" required /></label>}
            {action.type === 'purchase' && <label>Parcelas<input type="number" min="1" max="24" value={action.installments} onChange={(e) => setAction({ ...action, installments: e.target.value })} required /></label>}
            {(action.type === 'transfer' || action.type === 'scheduled' || action.type === 'withdraw') && <label>Valor<input type="number" min="0.01" step="0.01" value={action.amount} onChange={(e) => setAction({ ...action, amount: e.target.value })} placeholder="R$ 0,00" required /></label>}
            {action.type === 'scheduled' && <label>Data e hora<input type="datetime-local" value={action.date} onChange={(e) => setAction({ ...action, date: e.target.value })} required /></label>}
            {action.type === 'loan' && <div className="action-form-row"><label>Valor solicitado<input type="number" min="0.01" step="0.01" value={action.amount} onChange={(e) => setAction({ ...action, amount: e.target.value })} placeholder="R$ 0,00" required /></label><label>Meses<input type="number" min="1" value={action.months} onChange={(e) => setAction({ ...action, months: e.target.value })} required /></label><label>Juros mensal<input type="number" min="0" step="0.01" value={action.rate} onChange={(e) => setAction({ ...action, rate: e.target.value })} required /></label></div>}
            {action.type === 'loan' && <div className="loan-preview">Simulação: você receberá <strong>{formatValue(action.amount)}</strong> e pagará aproximadamente <strong>{formatValue(loanPreview)}</strong> ao final de {action.months} meses.</div>}
            {action.type === 'purchase' && <div className="loan-preview">Cada parcela aproximada: <strong>{formatValue(Number(action.amount || 0) / Number(action.installments || 1))}</strong>. Ela será adicionada à sua fatura atual.</div>}
            {action.type === 'goal' && caixinhas.length > 0 && <p className="form-hint">Digite o mesmo nome de uma caixinha existente para guardar mais dinheiro nela.</p>}
            <button className="dashboard-button" disabled={submitting || ((action.type === 'transfer' || action.type === 'scheduled') && !recipient)}>{submitting ? 'Processando...' : action.type === 'scheduled' ? 'Agendar transferência' : action.type === 'transfer' ? 'Continuar para confirmação' : 'Confirmar operação'} <span>↗</span></button>
          </form>}
        </section>}

        {pendingTransfer && <div className="confirmation-backdrop" role="dialog" aria-modal="true" aria-labelledby="transfer-confirm-title">
          <div className="confirmation-modal">
            <span className="confirmation-icon">✓</span>
            <p className="eyebrow">Confirme os dados</p>
            <h2 id="transfer-confirm-title">Você está enviando {formatValue(pendingTransfer.amount)}</h2>
            <p className="confirmation-copy">Confira se a transferência será feita para a pessoa certa:</p>
            <div className="confirmation-recipient"><span className="user-avatar">{pendingTransfer.recipient.nome.charAt(0).toUpperCase()}</span><div><strong>{pendingTransfer.recipient.nome}</strong><small>Conta nº {pendingTransfer.recipient.idConta}</small><small>{pendingTransfer.recipient.celular || pendingTransfer.recipient.cpf || 'Dados conferidos'}</small></div></div>
            <div className="confirmation-actions"><button className="secondary-button" onClick={() => setPendingTransfer(null)}>Corrigir dados</button><button className="dashboard-button" onClick={confirmTransfer} disabled={submitting}>{submitting ? 'Enviando...' : 'Confirmar transferência'} <span>↗</span></button></div>
          </div>
        </div>}

        <div className="dashboard-columns">
          <section className="dashboard-panel activity-panel" id="extrato">
            <div className="panel-heading"><div><p className="panel-kicker">Acompanhe de perto</p><h2>Últimas movimentações</h2></div><a href="#extrato">Ver extrato completo ↗</a></div>
            {extrato.length ? <div className="activity-list">{extrato.map((item) => { const incoming = item.contaDestino?.idConta === conta.idConta; return <div className="activity-row" key={item.idTransacao}><span className={`activity-icon ${incoming ? 'incoming' : 'outgoing'}`}>{transactionIcon(item.tipo)}</span><div><strong>{transactionLabel(item, incoming)}</strong><small>{item.dataHora ? dateFormatter.format(new Date(item.dataHora)) : 'Recentemente'}</small></div><b className={incoming ? 'incoming-text' : ''}>{incoming ? '+' : '-'} {formatValue(item.valor)}</b></div>; })}</div> : <div className="empty-state">Ainda não há movimentações. Faça seu primeiro depósito.</div>}
          </section>
          <section className="dashboard-panel reserve-panel" id="emprestimos">
            <div className="panel-heading"><div><p className="panel-kicker">Organize seus objetivos</p><h2>Suas caixinhas</h2></div><span className="panel-actions"><button onClick={() => openAction('withdraw')}>Resgatar</button><button onClick={() => openAction('goal')}>+ Nova</button></span></div>
            {caixinhas.length ? <div className="reserve-list">{caixinhas.map((item, index) => <div className="reserve-row" key={item.idCaixinha}><span className={`reserve-icon reserve-${index % 3}`}>◎</span><div><strong>{item.nome}</strong><small>{String(item.idCaixinha) === String(featuredGoal?.idCaixinha) ? 'Em destaque' : 'Objetivo pessoal'}</small></div><b>{formatValue(item.valorGuardado)}</b><button className={`reserve-feature-button ${String(item.idCaixinha) === String(featuredGoal?.idCaixinha) ? 'selected' : ''}`} onClick={() => setFeaturedGoal(item.idCaixinha)} title="Definir como destaque" aria-label={`Definir ${item.nome} como destaque`}>★</button>{Number(item.valorGuardado || 0) === 0 && <button className="reserve-delete-button" onClick={() => deleteEmptyGoal(item)} title="Excluir caixinha vazia" aria-label={`Excluir ${item.nome}`}>×</button>}</div>)}</div> : <div className="empty-state">Crie uma caixinha para começar a guardar.</div>}
            <button className="panel-link" onClick={() => openAction('goal')}>Guardar dinheiro <span>↗</span></button>
          </section>
        </div>
        <section className="dashboard-panel loan-summary" id="agendamentos">
          <div className="panel-heading"><div><p className="panel-kicker">Crédito para seus planos</p><h2>Resumo financeiro</h2></div><button onClick={() => openAction('loan')}>Simular empréstimo ↗</button></div>
          <div className="summary-items"><div><span>Fatura atual</span><strong>{formatValue(conta.fatura)}</strong><small>Nenhuma fatura pendente</small></div><div><span>Empréstimos ativos</span><strong>{activeLoans.length}</strong><small>{activeLoans.length ? formatValue(activeLoans.reduce((sum, item) => sum + Number(item.valorTotalComJuros || 0), 0)) + ' contratados' : 'Você está em dia'}</small></div><div><span>Agendamentos</span><strong>{pendingSchedules.length}</strong><small>{pendingSchedules.length ? 'Transferências programadas' : 'Nenhuma transferência pendente'}</small></div></div>
        </section>
        {(activeLoans.length > 0 || pendingSchedules.length > 0) && <section className="financial-details">
          {activeLoans.length > 0 && <div className="financial-detail-card loan-detail-card">
            <div className="detail-heading"><span className="detail-icon">▣</span><div><p className="panel-kicker">Acompanhe seu crédito</p><h2>Empréstimos ativos</h2></div><span className="detail-count">{activeLoans.length}</span></div>
            <div className="detail-list">{activeLoans.map((loan) => <div className="detail-row" key={loan.idEmprestimo}><div><strong>{formatValue(loan.valorSolicitado)} contratados</strong><small>{loan.quantidadeMeses} meses · taxa de {Number(loan.taxaJuros || 0) * 100}% ao mês</small></div><div className="detail-value"><strong>{formatValue(loan.valorTotalComJuros)}</strong><small>Total com juros</small><button className="loan-pay-button" type="button" onClick={() => payLoan(loan)}>Pagar empréstimo</button></div></div>)}</div>
          </div>}
          {pendingSchedules.length > 0 && <div className="financial-detail-card schedule-detail-card">
            <div className="detail-heading"><span className="detail-icon">◷</span><div><p className="panel-kicker">Próximos movimentos</p><h2>Transferências agendadas</h2></div><span className="detail-count">{pendingSchedules.length}</span></div>
            <div className="detail-list">{pendingSchedules.map((schedule) => <div className="detail-row" key={schedule.idAgendamento}><div><strong>{formatValue(schedule.valor)} para conta nº {schedule.contaDestino?.idConta || '—'}</strong><small>{schedule.dataHoraAgendada ? dateTimeFormatter.format(new Date(schedule.dataHoraAgendada)) : 'Data não informada'}</small></div><span className="schedule-status">{schedule.status}</span></div>)}</div>
          </div>}
        </section>}
      </section>
    </main>
  );
}
