package br.com.fiap.fintech.service;

import br.com.fiap.fintech.dto.CaixinhaDto;
import br.com.fiap.fintech.model.Caixinha;
import br.com.fiap.fintech.model.Conta;
import br.com.fiap.fintech.repository.CaixinhaRepository;
import br.com.fiap.fintech.repository.ContaRepository;
import br.com.fiap.fintech.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CaixinhaService {
    @Autowired
    private CaixinhaRepository caixinhaRepository;

    @Autowired
    private ContaRepository contaRepository;


    @Transactional
    public Caixinha guardarDinheiro(CaixinhaDto dto){
        if (dto.getValor() == null || dto.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor para guardar deve ser maior que zero");
        }

        Conta conta = contaRepository.findById(dto.getIdConta())
                .orElseThrow(() -> new RuntimeException("Conta não encontrada"));

        // Valida se a conta tem saldo livre suficiente
        if (conta.getSaldo().compareTo(dto.getValor()) < 0) {
            throw new RuntimeException("Saldo insuficiente na conta para guardar nesta caixinha");
        }

        // Tira o dinheiro do saldo principal
        conta.setSaldo(conta.getSaldo().subtract(dto.getValor()));
        contaRepository.save(conta);

        // Busca se já existe uma caixinha com esse nome para essa conta, senão cria uma nova
        Caixinha caixinha = caixinhaRepository.findByContaIdConta(dto.getIdConta()).stream()
                .filter(c -> c.getNome().equalsIgnoreCase(dto.getNome()))
                .findFirst()
                .orElseGet(() -> {
                    Caixinha nova = new Caixinha();
                    nova.setNome(dto.getNome());
                    nova.setConta(conta);
                    nova.setValorGuardado(BigDecimal.ZERO);
                    return nova;
                });

        // Adiciona o valor na caixinha
        caixinha.setValorGuardado(caixinha.getValorGuardado().add(dto.getValor()));
        if (dto.getMeta() != null && dto.getMeta().compareTo(BigDecimal.ZERO) > 0) {
            caixinha.setMeta(dto.getMeta());
        }
        return caixinhaRepository.save(caixinha);
    }

    @Transactional
    public Caixinha resgatarDinheiro(Long idCaixinha, BigDecimal valorResgate) {
        if (valorResgate == null || valorResgate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor do resgate deve ser maior que zero");
        }

        Caixinha caixinha = caixinhaRepository.findById(idCaixinha)
                .orElseThrow(() -> new ResourceNotFoundException("Caixinha não encontrada"));

        // Valida se a caixinha tem saldo suficiente para o resgate
        if (caixinha.getValorGuardado().compareTo(valorResgate) < 0) {
            throw new RuntimeException("A caixinha não possui saldo suficiente para este resgate");
        }

        // Retira o valor da caixinha
        caixinha.setValorGuardado(caixinha.getValorGuardado().subtract(valorResgate));
        caixinhaRepository.save(caixinha);

        // Devolve o dinheiro para o saldo principal da conta
        Conta conta = caixinha.getConta();
        conta.setSaldo(conta.getSaldo().add(valorResgate));
        contaRepository.save(conta);

        return caixinha;
    }

    public List<Caixinha> listarCaixinhasPorConta(Long idConta) {
        contaRepository.findById(idConta)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
        return caixinhaRepository.findByContaIdConta(idConta);
    }

    @Transactional
    public Caixinha atualizarCaixinha(Long idCaixinha, CaixinhaDto dto) {
        Caixinha caixinha = caixinhaRepository.findById(idCaixinha)
                .orElseThrow(() -> new ResourceNotFoundException("Caixinha não encontrada"));
        if (dto.getIdConta() == null || !caixinha.getConta().getIdConta().equals(dto.getIdConta())) {
            throw new RuntimeException("A caixinha não pertence a esta conta");
        }
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new RuntimeException("O nome da caixinha é obrigatório");
        }
        caixinha.setNome(dto.getNome().trim());
        if (dto.getMeta() != null && dto.getMeta().compareTo(BigDecimal.ZERO) > 0) {
            caixinha.setMeta(dto.getMeta());
        }
        return caixinhaRepository.save(caixinha);
    }

    @Transactional
    public void excluirCaixinhaVazia(Long idCaixinha, Long idConta) {
        Caixinha caixinha = caixinhaRepository.findById(idCaixinha)
                .orElseThrow(() -> new RuntimeException("Caixinha não encontrada"));

        if (!caixinha.getConta().getIdConta().equals(idConta)) {
            throw new RuntimeException("A caixinha não pertence a esta conta");
        }
        if (caixinha.getValorGuardado().compareTo(BigDecimal.ZERO) != 0) {
            throw new RuntimeException("Só é possível excluir uma caixinha vazia");
        }

        caixinhaRepository.delete(caixinha);
    }
}
