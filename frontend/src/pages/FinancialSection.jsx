import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...(options?.headers || {}) },
    });
  } catch {
    throw new Error('Não foi possível conectar ao backend.');
  }
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(body?.mensagem || body?.message || body || 'Não foi possível carregar os dados.');
  }
  return body;
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /></span>;
}

function formatValue(value) {
  return currency.format(Number(value || 0));
}

function transactionLabel(transaction, incoming) {
  if (transaction.tipo === 'DEPOSITO') return transaction.nomeRemetente ? `Depósito recebido de ${transaction.nomeRemetente}` : 'Depósito recebido';
  if (transaction.tipo === 'EMPRESTIMO_CONCEDIDO') return 'Empréstimo liberado';
  if (transaction.tipo === 'COMPRA_CARTAO') return 'Compra no cartão';
  if (transaction.tipo === 'PAGAMENTO_FATURA') return 'Pagamento de fatura';
  if (transaction.tipo === 'TRANSFERENCIA' || transaction.tipo === 'TRANSFERENCIA_AGENDADA') {
    const scheduled = transaction.tipo === 'TRANSFERENCIA_AGENDADA';
    if (incoming) return `${scheduled ? 'Transferência agendada recebida de' : 'Transferência recebida de'} ${transaction.nomeRemetente || 'outra conta'}`;
    return `${scheduled ? 'Transferência agendada enviada para' : 'Transferência enviada para'} ${transaction.nomeDestinatario || 'outra conta'}`;
  }
  return transaction.tipo || 'Movimentação';
}

function sectionInfo(type) {
  return {
    extrato: { title: 'Extrato da conta', kicker: 'Histórico completo', description: 'Consulte todas as entradas e saídas da sua conta.' },
    caixinhas: { title: 'Suas caixinhas', kicker: 'Organize seus objetivos', description: 'Acompanhe quanto você já guardou para cada plano.' },
    emprestimos: { title: 'Seus empréstimos', kicker: 'Crédito para seus planos', description: 'Visualize contratos ativos e valores contratados.' },
    agendamentos: { title: 'Transferências agendadas', kicker: 'Próximos movimentos', description: 'Acompanhe os envios programados para outras contas.' },
  }[type];
}

export function FinancialSection() {
  const location = useLocation();
  const navigate = useNavigate();
  const type = location.pathname.slice(1);
  const info = sectionInfo(type) || sectionInfo('extrato');
  const [usuario, setUsuario] = useState(null);
  const [conta, setConta] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [form, setForm] = useState({ mode: 'save', name: '', amount: '', meta: '', caixinhaId: '', months: '12', rate: '0.02', target: '', date: '', recipient: null, recipientLoading: false });

  const loadData = useCallback(async (parsedUser) => {
    const contas = await request(`/conta/usuario/${parsedUser.id}`);
    const currentAccount = contas?.[0];
    if (!currentAccount) throw new Error('Nenhuma conta foi encontrada.');
    const endpoint = {
      extrato: `/conta/${currentAccount.idConta}/extrato`,
      caixinhas: `/caixinhas/lista/${currentAccount.idConta}`,
      emprestimos: `/emprestimos/conta/${currentAccount.idConta}`,
      agendamentos: `/agendamentos/conta/${currentAccount.idConta}`,
    }[type] || `/conta/${currentAccount.idConta}/extrato`;
    const result = await request(endpoint);
    setConta(currentAccount);
    setData(result || []);
  }, [type]);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuarioLogado');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUsuario(parsedUser);
    loadData(parsedUser).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
  }, [loadData, navigate]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const loanPreview = Number(form.amount) > 0
    ? Number(form.amount) * ((1 + Number(form.rate || 0)) ** Number(form.months || 1))
    : 0;

  const findRecipient = async () => {
    if (!form.target.trim()) {
      setFeedback({ type: 'error', message: 'Informe nome, celular, CPF ou número da conta.' });
      return;
    }
    updateForm('recipientLoading', true);
    try {
      const found = await request(`/usuario/destinatario?identificador=${encodeURIComponent(form.target.trim())}`);
      if (found.idConta === conta.idConta) throw new Error('A conta de destino precisa ser diferente da sua.');
      setForm((current) => ({ ...current, recipient: found, recipientLoading: false }));
    } catch (loadError) {
      setForm((current) => ({ ...current, recipient: null, recipientLoading: false }));
      setFeedback({ type: 'error', message: loadError.message });
    }
  };

  const submitAction = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    try {
      setSubmitting(true);
      setFeedback({ type: '', message: '' });
      if (type === 'caixinhas') {
        if (form.mode === 'edit') {
          if (!editingGoalId || !form.name.trim()) throw new Error('Informe o nome da caixinha.');
          await request(`/caixinhas/${editingGoalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idConta: conta.idConta, nome: form.name.trim(), meta: form.meta ? Number(form.meta) : null }),
          });
        } else if (form.mode === 'withdraw') {
          if (!form.caixinhaId || amount <= 0) throw new Error('Selecione a caixinha e informe um valor válido.');
          await request(`/caixinhas/${form.caixinhaId}/resgatar?valor=${amount}`, { method: 'POST' });
        } else {
          if (!form.name.trim() || amount <= 0) throw new Error('Informe o nome da caixinha e um valor válido.');
          await request('/caixinhas/guardar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idConta: conta.idConta, nome: form.name.trim(), valor: amount, meta: form.meta ? Number(form.meta) : null }) });
        }
      } else if (type === 'emprestimos') {
        if (amount <= 0) throw new Error('Informe um valor maior que zero.');
        const loanPayload = { idConta: conta.idConta, valorSolicitado: amount, taxaJuros: Number(form.rate), quantidadeMeses: Number(form.months), mesesCarencia: 0 };
        await request(editingLoanId ? `/emprestimos/${editingLoanId}` : '/emprestimos', { method: editingLoanId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loanPayload) });
      } else if (type === 'agendamentos') {
        if (!form.recipient || amount <= 0 || !form.date) throw new Error('Encontre o destinatário, informe o valor e a data.');
        const schedulePayload = { idContaOrigem: conta.idConta, idContaDestino: form.recipient.idConta, valor: amount, dataHoraAgendada: form.date };
        await request(editingScheduleId ? `/agendamentos/${editingScheduleId}` : '/agendamentos', { method: editingScheduleId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(schedulePayload) });
      }
      setFeedback({ type: 'success', message: 'Operação realizada com sucesso.' });
      setEditingGoalId(null);
      setEditingLoanId(null);
      setEditingScheduleId(null);
      setForm({ mode: 'save', name: '', amount: '', meta: '', caixinhaId: '', months: '12', rate: '0.02', target: '', date: '', recipient: null, recipientLoading: false });
      await loadData(usuario);
    } catch (submitError) {
      setFeedback({ type: 'error', message: submitError.message });
    } finally {
      setSubmitting(false);
    }
  };

  const editGoal = (goal) => {
    setEditingGoalId(goal.idCaixinha);
    setForm((current) => ({ ...current, mode: 'edit', name: goal.nome, meta: goal.meta || '' }));
  };

  const deleteGoal = async (goal) => {
    try {
      await request(`/caixinhas/${goal.idCaixinha}?idConta=${conta.idConta}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Caixinha excluída com sucesso.' });
      await loadData(usuario);
    } catch (deleteError) {
      setFeedback({ type: 'error', message: deleteError.message });
    }
  };

  const editLoan = (loan) => {
    setEditingLoanId(loan.idEmprestimo);
    setForm((current) => ({ ...current, mode: 'edit', amount: loan.valorSolicitado, months: loan.quantidadeMeses, rate: loan.taxaJuros }));
  };

  const deleteLoan = async (loan) => {
    try {
      await request(`/emprestimos/${loan.idEmprestimo}?idConta=${conta.idConta}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Empréstimo excluído com sucesso.' });
      await loadData(usuario);
    } catch (deleteError) {
      setFeedback({ type: 'error', message: deleteError.message });
    }
  };

  const editSchedule = (schedule) => {
    setEditingScheduleId(schedule.idAgendamento);
    setForm((current) => ({
      ...current,
      mode: 'edit',
      amount: schedule.valor,
      date: schedule.dataHoraAgendada ? schedule.dataHoraAgendada.slice(0, 16) : '',
      recipient: { idConta: schedule.contaDestino?.idConta, nome: schedule.contaDestino?.idConta ? `Conta ${schedule.contaDestino.idConta}` : 'Destinatário' },
      target: schedule.contaDestino?.idConta ? String(schedule.contaDestino.idConta) : '',
    }));
  };

  const deleteSchedule = async (schedule) => {
    try {
      await request(`/agendamentos/${schedule.idAgendamento}?idConta=${conta.idConta}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Agendamento excluído com sucesso.' });
      await loadData(usuario);
    } catch (deleteError) {
      setFeedback({ type: 'error', message: deleteError.message });
    }
  };

  const payLoan = async (loan) => {
    try {
      await request(`/emprestimos/${loan.idEmprestimo}/pagar?idConta=${conta.idConta}`, { method: 'POST' });
      setFeedback({ type: 'success', message: 'Empréstimo quitado com sucesso.' });
      await loadData(usuario);
    } catch (paymentError) {
      setFeedback({ type: 'error', message: paymentError.message });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    navigate('/login');
  };

  if (loading) return <div className="dashboard-loading"><BrandMark /><p>Carregando sua área financeira...</p></div>;
  if (!usuario || !conta) return <div className="dashboard-loading"><p>{error || 'Não foi possível carregar os dados.'}</p><button className="dashboard-button" onClick={() => navigate('/home')}>Voltar</button></div>;

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div>
          <a className="brand dashboard-brand" href="/home"><BrandMark /><span>finora</span></a>
          <p className="sidebar-label">MENU PRINCIPAL</p>
          <nav className="dashboard-nav">
            <a href="/home"><span>⌂</span> Visão geral</a>
            <a className={type === 'extrato' ? 'active' : ''} href="/extrato"><span>↕</span> Extrato</a>
            <a className={type === 'caixinhas' ? 'active' : ''} href="/caixinhas"><span>◉</span> Caixinhas</a>
            <a className={type === 'emprestimos' ? 'active' : ''} href="/emprestimos"><span>＋</span> Empréstimos</a>
            <a className={type === 'agendamentos' ? 'active' : ''} href="/agendamentos"><span>◷</span> Agendamentos</a>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="support-card"><span>✦</span><strong>Precisa de ajuda?</strong><small>Fale com nosso suporte</small></div>
          <button className="logout-button" onClick={handleLogout}><span>↪</span> Sair da conta</button>
        </div>
      </aside>
      <section className="dashboard-content focused-page">
        <header className="dashboard-header">
          <div><p className="dashboard-date">{info.kicker}</p><h1>{info.title}</h1><p className="dashboard-subtitle">{info.description}</p></div>
          <div className="dashboard-user"><span className="user-avatar">{usuario.nome?.charAt(0).toUpperCase() || 'U'}</span><div><strong>{usuario.nome}</strong><small>Conta pessoal</small></div></div>
        </header>
        {error && <div className="dashboard-feedback error">{error}</div>}
        {feedback.message && <div className={`dashboard-feedback ${feedback.type}`}>{feedback.message}</div>}
        {type !== 'extrato' && <section className="focused-action-panel">
          <div className="panel-heading"><div><p className="panel-kicker">Ação rápida</p><h2>{type === 'caixinhas' ? 'Movimentar uma caixinha' : type === 'emprestimos' ? 'Simular empréstimo' : 'Agendar transferência'}</h2></div></div>
          <form onSubmit={submitAction} className="focused-form">
            {type === 'caixinhas' && <label>Operação<select value={form.mode} onChange={(event) => updateForm('mode', event.target.value)}><option value="save">Guardar dinheiro</option><option value="withdraw">Resgatar dinheiro</option>{editingGoalId && <option value="edit">Editar caixinha</option>}</select></label>}
            {type === 'caixinhas' && form.mode === 'withdraw' && <label>Caixinha<select value={form.caixinhaId} onChange={(event) => updateForm('caixinhaId', event.target.value)} required><option value="">Selecione uma caixinha</option>{data.map((item) => <option key={item.idCaixinha} value={item.idCaixinha}>{item.nome} · {formatValue(item.valorGuardado)}</option>)}</select></label>}
            {type === 'caixinhas' && (form.mode === 'save' || form.mode === 'edit') && <label>Nome da caixinha<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Ex.: Viagem" required /></label>}
            {type === 'caixinhas' && (form.mode === 'save' || form.mode === 'edit') && <label>Meta (opcional)<input type="number" min="0.01" step="0.01" value={form.meta} onChange={(event) => updateForm('meta', event.target.value)} /></label>}
            {(type === 'emprestimos' || type === 'caixinhas' && form.mode !== 'edit') && <label>{type === 'caixinhas' ? 'Valor' : 'Valor solicitado'}<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} required /></label>}
            {type === 'emprestimos' && <><label>Meses<input type="number" min="1" value={form.months} onChange={(event) => updateForm('months', event.target.value)} required /></label><label>Juros mensal<input type="number" min="0" step="0.01" value={form.rate} onChange={(event) => updateForm('rate', event.target.value)} required /></label></>}
            {type === 'emprestimos' && <div className="loan-preview focused-loan-preview">Simulação: você receberá <strong>{formatValue(form.amount)}</strong> e pagará aproximadamente <strong>{formatValue(loanPreview)}</strong> ao final de {form.months} meses.</div>}
            {type === 'agendamentos' && <><label>Destinatário<input value={form.target} onChange={(event) => setForm((current) => ({ ...current, target: event.target.value, recipient: null }))} placeholder="Nome, CPF, celular ou conta" required /></label>{!editingScheduleId && <button type="button" className="dashboard-button secondary-button" onClick={findRecipient} disabled={form.recipientLoading}>{form.recipientLoading ? 'Buscando...' : 'Encontrar'}</button>}{form.recipient && <div className="focused-recipient"><strong>{form.recipient.nome}</strong><small>Conta nº {form.recipient.idConta}</small></div>}<label>Valor<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} required /></label><label>Data e hora<input type="datetime-local" value={form.date} onChange={(event) => updateForm('date', event.target.value)} required /></label></>}
            <button className="dashboard-button" disabled={submitting}>{submitting ? 'Processando...' : form.mode === 'edit' ? 'Salvar alterações' : 'Confirmar operação'} <span>↗</span></button>
          </form>
        </section>}
        <section className={`focused-panel focused-${type}`}>
          {type === 'extrato' && <><div className="focused-table-head"><span>Movimentação</span><span>Data e hora</span><span>Valor</span></div>{data.length ? data.map((item) => { const incoming = item.contaDestino?.idConta === conta.idConta; return <div className="focused-row" key={item.idTransacao}><div><strong>{transactionLabel(item, incoming)}</strong><small>{incoming ? 'Entrada na conta' : 'Saída da conta'}</small></div><span>{item.dataHora ? dateTimeFormatter.format(new Date(item.dataHora)) : '—'}</span><b className={incoming ? 'incoming-text' : ''}>{incoming ? '+' : '-'} {formatValue(item.valor)}</b></div>; }) : <div className="focused-empty">Nenhuma movimentação encontrada.</div>}</>}
          {type === 'caixinhas' && <>{data.length ? data.map((item) => <div className="focused-row" key={item.idCaixinha}><div><strong>{item.nome}</strong><small>{item.meta ? `Meta de ${formatValue(item.meta)}` : 'Objetivo pessoal'}</small></div><span>Saldo guardado</span><b className="incoming-text">{formatValue(item.valorGuardado)}</b><button className="caixinha-edit-button" type="button" onClick={() => editGoal(item)}>Editar</button>{Number(item.valorGuardado || 0) === 0 && <button className="caixinha-delete-button" type="button" onClick={() => deleteGoal(item)}>Excluir</button>}</div>) : <div className="focused-empty">Você ainda não criou nenhuma caixinha.</div>}</>}
          {type === 'emprestimos' && <>{data.length ? data.map((item) => <div className="focused-row" key={item.idEmprestimo}><div><strong>{formatValue(item.valorSolicitado)} contratados</strong><small>{item.quantidadeMeses} meses · taxa de {Number(item.taxaJuros || 0) * 100}% ao mês</small></div><span>{item.status || '—'}</span><b>{formatValue(item.valorTotalComJuros)}</b>{item.status === 'ATIVO' && <><button className="loan-pay-button" type="button" onClick={() => editLoan(item)}>Editar</button><button className="loan-pay-button" type="button" onClick={() => payLoan(item)}>Pagar empréstimo</button></>}{item.status === 'QUITADO' && <button className="caixinha-delete-button" type="button" onClick={() => deleteLoan(item)}>Excluir</button>}</div>) : <div className="focused-empty">Você não possui empréstimos contratados.</div>}</>}
          {type === 'agendamentos' && <>{data.length ? data.map((item) => <div className="focused-row" key={item.idAgendamento}><div><strong>{formatValue(item.valor)} para conta nº {item.contaDestino?.idConta || '—'}</strong><small>{item.dataHoraAgendada ? dateTimeFormatter.format(new Date(item.dataHoraAgendada)) : 'Data não informada'}</small></div><span>{item.status || '—'}</span><b>{item.status === 'EXECUTADA' ? 'Concluída' : 'Programada'}</b>{item.status === 'PENDENTE' && <><button className="loan-pay-button" type="button" onClick={() => editSchedule(item)}>Editar</button><button className="caixinha-delete-button" type="button" onClick={() => deleteSchedule(item)}>Excluir</button></>}</div>) : <div className="focused-empty">Você não possui transferências agendadas.</div>}</>}
        </section>
      </section>
    </main>
  );
}
