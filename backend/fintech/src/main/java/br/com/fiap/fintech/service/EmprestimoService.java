package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.EmprestimoDto;
import br.com.fiap.fintech.model.Conta;
import br.com.fiap.fintech.model.Emprestimo;
import br.com.fiap.fintech.model.Transacao;
import br.com.fiap.fintech.repository.ContaRepository;
import br.com.fiap.fintech.repository.EmprestimoRepository;
import br.com.fiap.fintech.repository.TransacaoRepository;
import br.com.fiap.fintech.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class EmprestimoService {
    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Transactional
    public Emprestimo solicitarEmprestimo(EmprestimoDto dto) {
        if (dto.getValorSolicitado() == null || dto.getValorSolicitado().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor do empréstimo deve ser maior que zero");
        }
        if (dto.getTaxaJuros() == null || dto.getTaxaJuros().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("A taxa de juros informada é inválida");
        }
        if (dto.getQuantidadeMeses() == null || dto.getQuantidadeMeses() <= 0) {
            throw new RuntimeException("A quantidade de meses deve ser maior que zero");
        }

        Conta conta = contaRepository.findById(dto.getIdConta())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        // Cálculo de Juros Compostos: Montante = Capital * (1 + taxa)^meses
        BigDecimal fator = BigDecimal.ONE.add(dto.getTaxaJuros());
        BigDecimal montanteComJuros = dto.getValorSolicitado().multiply(fator.pow(dto.getQuantidadeMeses()));
        montanteComJuros = montanteComJuros.setScale(2, RoundingMode.HALF_UP);

        // Criando o registro do empréstimo
        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setConta(conta);
        emprestimo.setValorSolicitado(dto.getValorSolicitado());
        emprestimo.setTaxaJuros(dto.getTaxaJuros());
        emprestimo.setQuantidadeMeses(dto.getQuantidadeMeses());
        emprestimo.setMesesCarencia(dto.getMesesCarencia() != null ? dto.getMesesCarencia() : 0);
        emprestimo.setValorTotalComJuros(montanteComJuros);
        emprestimo.setStatus("ATIVO");

        emprestimoRepository.save(emprestimo);

        // Libera o dinheiro imediatamente no saldo da conta do cliente
        conta.setSaldo(conta.getSaldo().add(dto.getValorSolicitado()));
        contaRepository.save(conta);

        // Registra a transação no extrato geral
        Transacao transacao = new Transacao();
        transacao.setTipo("EMPRESTIMO_CONCEDIDO");
        transacao.setValor(dto.getValorSolicitado());
        transacao.setContaDestino(conta);
        transacaoRepository.save(transacao);

        return emprestimo;
    }

    public List<Emprestimo> listarEmprestimosPorConta(Long idConta) {
        contaRepository.findById(idConta)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
        return emprestimoRepository.findByContaIdConta(idConta);
    }

    @Transactional
    public Emprestimo atualizarEmprestimo(Long idEmprestimo, EmprestimoDto dto) {
        Emprestimo emprestimo = emprestimoRepository.findById(idEmprestimo)
                .orElseThrow(() -> new ResourceNotFoundException("Empréstimo não encontrado"));
        if (!emprestimo.getConta().getIdConta().equals(dto.getIdConta())) {
            throw new RuntimeException("O empréstimo não pertence a esta conta");
        }
        if (!"ATIVO".equals(emprestimo.getStatus())) {
            throw new RuntimeException("Somente empréstimos ativos podem ser editados");
        }
        if (dto.getTaxaJuros() == null || dto.getTaxaJuros().compareTo(BigDecimal.ZERO) < 0
                || dto.getQuantidadeMeses() == null || dto.getQuantidadeMeses() <= 0) {
            throw new RuntimeException("Informe uma taxa e uma quantidade de meses válidas");
        }
        BigDecimal fator = BigDecimal.ONE.add(dto.getTaxaJuros());
        BigDecimal total = emprestimo.getValorSolicitado()
                .multiply(fator.pow(dto.getQuantidadeMeses()))
                .setScale(2, RoundingMode.HALF_UP);
        emprestimo.setTaxaJuros(dto.getTaxaJuros());
        emprestimo.setQuantidadeMeses(dto.getQuantidadeMeses());
        emprestimo.setValorTotalComJuros(total);
        return emprestimoRepository.save(emprestimo);
    }

    @Transactional
    public void excluirEmprestimo(Long idEmprestimo, Long idConta) {
        Emprestimo emprestimo = emprestimoRepository.findById(idEmprestimo)
                .orElseThrow(() -> new ResourceNotFoundException("Empréstimo não encontrado"));
        if (!emprestimo.getConta().getIdConta().equals(idConta)) {
            throw new RuntimeException("O empréstimo não pertence a esta conta");
        }
        if ("ATIVO".equals(emprestimo.getStatus())) {
            throw new RuntimeException("Quite o empréstimo antes de excluí-lo");
        }
        emprestimoRepository.delete(emprestimo);
    }

    @Transactional
    public Emprestimo pagarEmprestimo(Long idEmprestimo, Long idConta) {
        Emprestimo emprestimo = emprestimoRepository.findById(idEmprestimo)
                .orElseThrow(() -> new RuntimeException("Empréstimo não encontrado"));
        if (!emprestimo.getConta().getIdConta().equals(idConta)) {
            throw new RuntimeException("O empréstimo não pertence a esta conta");
        }
        if (!"ATIVO".equals(emprestimo.getStatus())) {
            throw new RuntimeException("Este empréstimo já foi quitado");
        }

        Conta conta = emprestimo.getConta();
        BigDecimal valorPagamento = emprestimo.getValorTotalComJuros();
        if (conta.getSaldo().compareTo(valorPagamento) < 0) {
            throw new RuntimeException("Saldo insuficiente para quitar o empréstimo");
        }

        conta.setSaldo(conta.getSaldo().subtract(valorPagamento));
        contaRepository.save(conta);

        Transacao transacao = new Transacao();
        transacao.setTipo("PAGAMENTO_EMPRESTIMO");
        transacao.setValor(valorPagamento);
        transacao.setContaOrigem(conta);
        transacaoRepository.save(transacao);

        emprestimo.setStatus("QUITADO");
        return emprestimoRepository.save(emprestimo);
    }
}