package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.TransferenciaAgendadaDto;
import br.com.fiap.fintech.model.Conta;
import br.com.fiap.fintech.model.Transacao;
import br.com.fiap.fintech.model.TransferenciaAgendada;
import br.com.fiap.fintech.repository.ContaRepository;
import br.com.fiap.fintech.repository.TransacaoRepository;
import br.com.fiap.fintech.repository.TransferenciaAgendadaRepository;
import br.com.fiap.fintech.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransferenciaAgendadaService {
    private static final Logger logger = LoggerFactory.getLogger(TransferenciaAgendadaService.class);

    @Autowired
    private TransferenciaAgendadaRepository agendadaRepository;

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    @Transactional
    public TransferenciaAgendada agendarTransferencia(TransferenciaAgendadaDto dto) {
        if (dto.getIdContaOrigem().equals(dto.getIdContaDestino())) {
            throw new RuntimeException("A conta de origem e destino não podem ser a mesma");
        }
        if (dto.getValor() == null || dto.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor da transferência deve ser maior que zero");
        }
        if (dto.getDataHoraAgendada() == null || dto.getDataHoraAgendada().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("A data e hora do agendamento devem ser futuras");
        }

        Conta origem = contaRepository.findById(dto.getIdContaOrigem())
                .orElseThrow(() -> new RuntimeException("Conta de origem não encontrada"));
        Conta destino = contaRepository.findById(dto.getIdContaDestino())
                .orElseThrow(() -> new RuntimeException("Conta de destino não encontrada"));

        TransferenciaAgendada agendamento = new TransferenciaAgendada();
        agendamento.setContaOrigem(origem);
        agendamento.setContaDestino(destino);
        agendamento.setValor(dto.getValor());
        agendamento.setDataHoraAgendada(dto.getDataHoraAgendada());
        agendamento.setStatus("PENDENTE");

        return agendadaRepository.save(agendamento);
    }

    public List<TransferenciaAgendada> listarAgendamentosPorConta(Long idConta) {
        contaRepository.findById(idConta)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
        return agendadaRepository.findByContaOrigemIdConta(idConta);
    }

    @Transactional
    public TransferenciaAgendada atualizarTransferencia(Long idAgendamento, TransferenciaAgendadaDto dto) {
        TransferenciaAgendada agendamento = agendadaRepository.findById(idAgendamento)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
        if (!agendamento.getContaOrigem().getIdConta().equals(dto.getIdContaOrigem())) {
            throw new RuntimeException("O agendamento não pertence a esta conta");
        }
        if (!"PENDENTE".equals(agendamento.getStatus())) {
            throw new RuntimeException("Somente agendamentos pendentes podem ser editados");
        }
        if (dto.getIdContaDestino().equals(dto.getIdContaOrigem())
                || dto.getValor() == null || dto.getValor().compareTo(BigDecimal.ZERO) <= 0
                || dto.getDataHoraAgendada() == null || dto.getDataHoraAgendada().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Informe um destino, valor e data futura válidos");
        }
        Conta destino = contaRepository.findById(dto.getIdContaDestino())
                .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não encontrada"));
        agendamento.setContaDestino(destino);
        agendamento.setValor(dto.getValor());
        agendamento.setDataHoraAgendada(dto.getDataHoraAgendada());
        return agendadaRepository.save(agendamento);
    }

    @Transactional
    public void excluirTransferencia(Long idAgendamento, Long idConta) {
        TransferenciaAgendada agendamento = agendadaRepository.findById(idAgendamento)
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
        if (!agendamento.getContaOrigem().getIdConta().equals(idConta)) {
            throw new RuntimeException("O agendamento não pertence a esta conta");
        }
        if (!"PENDENTE".equals(agendamento.getStatus())) {
            throw new RuntimeException("Somente agendamentos pendentes podem ser excluídos");
        }
        agendadaRepository.delete(agendamento);
    }

    // Processador automático: verifica frequentemente os agendamentos vencidos.
    @Scheduled(fixedDelay = 10000, initialDelay = 1000)
    @Transactional
    public void processarTransferenciasAgendadas() {
        LocalDateTime agora = LocalDateTime.now();
        List<TransferenciaAgendada> pendentes = agendadaRepository.findTransferenciasPendentes(agora);

        for (TransferenciaAgendada agendamento : pendentes) {
            try {
                Conta origem = agendamento.getContaOrigem();
                Conta destino = agendamento.getContaDestino();

                // Valida se a origem possui saldo no momento da execução
                if (origem.getSaldo().compareTo(agendamento.getValor()) >= 0) {
                    origem.setSaldo(origem.getSaldo().subtract(agendamento.getValor()));
                    destino.setSaldo(destino.getSaldo().add(agendamento.getValor()));

                    contaRepository.save(origem);
                    contaRepository.save(destino);

                    // Registra na tabela de histórico geral de transações
                    Transacao transacao = new Transacao();
                    transacao.setTipo("TRANSFERENCIA_AGENDADA");
                    transacao.setValor(agendamento.getValor());
                    transacao.setContaOrigem(origem);
                    transacao.setContaDestino(destino);
                    transacaoRepository.save(transacao);

                    agendamento.setStatus("EXECUTADA");
                    logger.info("Transferência agendada {} executada: {} -> {}, valor {}",
                            agendamento.getIdAgendamento(), origem.getIdConta(), destino.getIdConta(), agendamento.getValor());
                } else {
                    agendamento.setStatus("FALHA_SALDO_INSUFICIENTE");
                    logger.warn("Transferência agendada {} não executada por saldo insuficiente na conta {}",
                            agendamento.getIdAgendamento(), origem.getIdConta());
                }

                agendadaRepository.saveAndFlush(agendamento);
            } catch (RuntimeException e) {
                agendamento.setStatus("ERRO");
                agendadaRepository.saveAndFlush(agendamento);
                logger.error("Erro ao processar a transferência agendada " + agendamento.getIdAgendamento(), e);
            }
        }
    }
}