package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.dto.CaixinhaDto;
import br.com.fiap.fintech.model.Caixinha;
import br.com.fiap.fintech.service.CaixinhaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/caixinhas")
public class CaixinhaController {

    @Autowired
    private CaixinhaService caixinhaService;

    @PostMapping("/guardar")
    public ResponseEntity<Caixinha> guardarDinheiro(@RequestBody CaixinhaDto dto) {
        Caixinha caixinha = caixinhaService.guardarDinheiro(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(caixinha);
    }

    @PutMapping("/{idCaixinha}")
    public ResponseEntity<Caixinha> atualizarCaixinha(@PathVariable Long idCaixinha, @RequestBody CaixinhaDto dto) {
        return ResponseEntity.ok(caixinhaService.atualizarCaixinha(idCaixinha, dto));
    }

    @PostMapping("/{idCaixinha}/resgatar")
    public ResponseEntity<Caixinha> resgatarDinheiro(@PathVariable Long idCaixinha, @RequestParam BigDecimal valor) {
        Caixinha caixinha = caixinhaService.resgatarDinheiro(idCaixinha, valor);
        return ResponseEntity.ok(caixinha);
    }

    @GetMapping("/lista/{idConta}")
    public ResponseEntity<List<Caixinha>> listarCaixinhas(@PathVariable Long idConta) {
        List<Caixinha> caixinhas = caixinhaService.listarCaixinhasPorConta(idConta);
        return ResponseEntity.ok(caixinhas);
    }

    @DeleteMapping("/{idCaixinha}")
    public ResponseEntity<Void> excluirCaixinha(
            @PathVariable Long idCaixinha,
            @RequestParam Long idConta
    ) {
        caixinhaService.excluirCaixinhaVazia(idCaixinha, idConta);
        return ResponseEntity.noContent().build();
    }
}