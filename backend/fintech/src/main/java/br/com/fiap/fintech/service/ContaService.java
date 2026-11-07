package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.DepositoDto;
import br.com.fiap.fintech.model.Conta;
import br.com.fiap.fintech.model.Transacao;
import br.com.fiap.fintech.model.Usuario;
import br.com.fiap.fintech.repository.ContaRepository;
import br.com.fiap.fintech.repository.TransacaoRepository;
import br.com.fiap.fintech.repository.UsuarioRepository;
import br.com.fiap.fintech.dto.TransferenciaDto;
import br.com.fiap.fintech.dto.CompraParceladaDto;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ContaService {

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TransacaoRepository transacaoRepository;

    public Conta salvarConta(Conta conta) {
        if (conta.getUsuario() != null && conta.getUsuario().getId() != null) {
            Usuario usuarioBanco = usuarioRepository.findById(conta.getUsuario().getId())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o ID informado"));
            conta.setUsuario(usuarioBanco);
        } else {
            throw new RuntimeException("A conta precisa estar associada a um usuário válido");
        }
        return contaRepository.save(conta);
    }

    public Conta atualizarConta(Conta conta){
        // Verifica se a conta realmente existe antes de atualizar
        Conta contaAntiga = contaRepository.findById(conta.getIdConta())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        // Valida e reatribui o usuário para evitar o erro de transiente
        if (conta.getUsuario() != null && conta.getUsuario().getId() != null) {
            Usuario usuarioBanco = usuarioRepository.findById(conta.getUsuario().getId())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o ID informado!"));
            conta.setUsuario(usuarioBanco);
        } else {
            // Se não mandou o usuário na atualização, mantém o usuário antigo da conta
            conta.setUsuario(contaAntiga.getUsuario());
        }

        return contaRepository.save(conta);
    }

    public List<Conta> listarContas() {
        return contaRepository.findAll();
    }

    public List<Conta> listarContaPorUsuario(Long idUsuario) {
        return contaRepository.findByUsuarioId(idUsuario);
    }

    public Optional<Conta> listarContaPorId(Long idConta) {
        return contaRepository.findById(idConta);
    }

    public void deletarConta(Long idConta) {
        contaRepository.deleteById(idConta);
    }

    @Transactional
    public void realizarTransferencia(TransferenciaDto dto) {
        // Validação: A conta de origem não pode ser igual à de destino
        if (dto.getIdContaOrigem().equals(dto.getIdContaDestino())) {
            throw new RuntimeException("A conta de origem e destino não podem ser a mesma");
        }

        // Buscar conta de origem
        Conta origem = contaRepository.findById(dto.getIdContaOrigem())
                .orElseThrow(() -> new RuntimeException("Conta de origem não encontrada"));

        // Buscar conta de destino
        Conta destino = contaRepository.findById(dto.getIdContaDestino())
                .orElseThrow(() -> new RuntimeException("Conta de destino não encontrada"));

        // Validar se a origem tem saldo suficiente (compareTo retorna < 0 se o saldo for menor que o valor)
        if (origem.getSaldo().compareTo(dto.getValor()) < 0) {
            throw new RuntimeException("Saldo insuficiente na conta de origem");
        }

        // Efetuar as operações matemáticas com BigDecimal
        origem.setSaldo(origem.getSaldo().subtract(dto.getValor()));
        destino.setSaldo(destino.getSaldo().add(dto.getValor()));

        // Salvar ambas as contas atualizadas no repositório
        contaRepository.save(origem);
        contaRepository.save(destino);

        // Registrar histórico da transferência
        Transacao transacao = new Transacao();
        transacao.setTipo("TRANSFERENCIA");
        transacao.setValor(dto.getValor());
        transacao.setContaOrigem(origem);
        transacao.setContaDestino(destino);
        transacaoRepository.save(transacao);
    }

    @Transactional
    public Conta depositar(DepositoDto dto) {
        if (dto.getValor() == null || dto.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor do depósito deve ser maior que zero!");
        }

        Conta conta = contaRepository.findById(dto.getIdConta())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        // Atualiza o saldo
        conta.setSaldo(conta.getSaldo().add(dto.getValor()));
        contaRepository.save(conta);

        // Registra a transação no histórico
        Transacao transacao = new Transacao();
        transacao.setTipo("DEPOSITO");
        transacao.setValor(dto.getValor());
        transacao.setContaDestino(conta);
        transacaoRepository.save(transacao);

        return conta;
    }

    public List<Transacao> listarExtrato(Long idConta) {
        // Valida se a conta existe antes de buscar o extrato
        contaRepository.findById(idConta)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        return transacaoRepository.buscarExtratoPorConta(idConta);
    }

    @Transactional
    public Conta registrarCompraParcelada(CompraParceladaDto dto) {
        if (dto.getValor() == null || dto.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor da compra deve ser maior que zero");
        }
        if (dto.getParcelas() == null || dto.getParcelas() <= 0) {
            throw new RuntimeException("A quantidade de parcelas deve ser maior que zero");
        }

        Conta conta = contaRepository.findById(dto.getIdConta())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        BigDecimal parcela = dto.getValor().divide(BigDecimal.valueOf(dto.getParcelas()), 2,
                java.math.RoundingMode.HALF_UP);
        BigDecimal faturaAtual = conta.getFatura() != null ? conta.getFatura() : BigDecimal.ZERO;
        conta.setFatura(faturaAtual.add(parcela));
        contaRepository.save(conta);

        Transacao transacao = new Transacao();
        transacao.setTipo("COMPRA_CARTAO");
        transacao.setValor(parcela);
        transacao.setContaDestino(conta);
        transacaoRepository.save(transacao);
        return conta;
    }

    @Transactional
    public Conta pagarFatura(Long idConta) {
        Conta conta = contaRepository.findById(idConta)
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));
        BigDecimal faturaAtual = conta.getFatura() != null ? conta.getFatura() : BigDecimal.ZERO;
        if (faturaAtual.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Não há fatura em aberto para pagar");
        }
        if (conta.getSaldo().compareTo(faturaAtual) < 0) {
            throw new RuntimeException("Saldo insuficiente para pagar a fatura");
        }

        BigDecimal valorPago = faturaAtual;
        conta.setSaldo(conta.getSaldo().subtract(valorPago));
        conta.setFatura(BigDecimal.ZERO);
        contaRepository.save(conta);

        Transacao transacao = new Transacao();
        transacao.setTipo("PAGAMENTO_FATURA");
        transacao.setValor(valorPago);
        transacao.setContaOrigem(conta);
        transacaoRepository.save(transacao);
        return conta;
    }
}