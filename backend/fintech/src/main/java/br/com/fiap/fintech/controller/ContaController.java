package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.dto.DepositoDto;
import br.com.fiap.fintech.dto.TransferenciaDto;
import br.com.fiap.fintech.dto.CompraParceladaDto;
import br.com.fiap.fintech.model.Conta;
import br.com.fiap.fintech.model.Transacao;
import br.com.fiap.fintech.service.ContaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/conta")
public class ContaController {
    @Autowired
    private ContaService contaService;


    @PostMapping()
    public ResponseEntity<Conta> criarConta(@RequestBody Conta conta) {
        Conta novaConta = contaService.salvarConta(conta);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaConta);
    }

    @PutMapping("/{idConta}")
    @ResponseStatus(HttpStatus.OK)
    public Conta atualizarConta(@PathVariable Long idConta, @RequestBody Conta conta){
        conta.setIdConta(idConta);
        return contaService.atualizarConta(conta);
    }

    @GetMapping
    public ResponseEntity<List<Conta>> listarContas() {
        List<Conta> contas = contaService.listarContas();
        return ResponseEntity.ok(contas);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Conta>> findByUsuarioId(@PathVariable Long idUsuario) {
        List<Conta> contas = contaService.listarContaPorUsuario(idUsuario);
        return ResponseEntity.ok(contas);
    }

    @GetMapping("/{idConta}")
    public ResponseEntity<Conta> buscarPorId(@PathVariable Long idConta) {
        return contaService.listarContaPorId(idConta)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{idConta}")
    public ResponseEntity<Void> deletarConta(@PathVariable Long idConta) {
        if (contaService.listarContaPorId(idConta).isPresent()) {
            contaService.deletarConta(idConta);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }


    @PostMapping("/transferencia")
    public ResponseEntity<String> realizarTransferencia(@RequestBody TransferenciaDto transferenciaDto) {
        contaService.realizarTransferencia(transferenciaDto);
        return ResponseEntity.ok("Transferência realizada com sucesso!");
    }

    @PostMapping("/depositar")
    public ResponseEntity<Conta> depositar(@RequestBody DepositoDto depositoDto) {
        Conta contaAtualizada = contaService.depositar(depositoDto);
        return ResponseEntity.ok(contaAtualizada);
    }

    @GetMapping("/{idConta}/extrato")
    public ResponseEntity<List<Transacao>> listarExtrato(@PathVariable Long idConta) {
        List<Transacao> extrato = contaService.listarExtrato(idConta);
        return ResponseEntity.ok(extrato);
    }

    @PostMapping("/compra-parcelada")
    public ResponseEntity<Conta> registrarCompraParcelada(@RequestBody CompraParceladaDto dto) {
        return ResponseEntity.ok(contaService.registrarCompraParcelada(dto));
    }

    @PostMapping("/{idConta}/pagar-fatura")
    public ResponseEntity<Conta> pagarFatura(@PathVariable Long idConta) {
        return ResponseEntity.ok(contaService.pagarFatura(idConta));
    }
}