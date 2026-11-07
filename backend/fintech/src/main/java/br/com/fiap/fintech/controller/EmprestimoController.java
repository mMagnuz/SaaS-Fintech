package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.dto.EmprestimoDto;
import br.com.fiap.fintech.model.Emprestimo;
import br.com.fiap.fintech.service.EmprestimoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    @Autowired
    private EmprestimoService emprestimoService;

    @PostMapping
    public ResponseEntity<Emprestimo> solicitarEmprestimo(@RequestBody EmprestimoDto dto) {
        Emprestimo emprestimo = emprestimoService.solicitarEmprestimo(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimo);
    }

    @GetMapping("/conta/{idConta}")
    public ResponseEntity<List<Emprestimo>> listarEmprestimos(@PathVariable Long idConta) {
        List<Emprestimo> lista = emprestimoService.listarEmprestimosPorConta(idConta);
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{idEmprestimo}")
    public ResponseEntity<Emprestimo> atualizarEmprestimo(
            @PathVariable Long idEmprestimo,
            @RequestBody EmprestimoDto dto
    ) {
        return ResponseEntity.ok(emprestimoService.atualizarEmprestimo(idEmprestimo, dto));
    }

    @DeleteMapping("/{idEmprestimo}")
    public ResponseEntity<Void> excluirEmprestimo(
            @PathVariable Long idEmprestimo,
            @RequestParam Long idConta
    ) {
        emprestimoService.excluirEmprestimo(idEmprestimo, idConta);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idEmprestimo}/pagar")
    public ResponseEntity<Emprestimo> pagarEmprestimo(
            @PathVariable Long idEmprestimo,
            @RequestParam Long idConta
    ) {
        return ResponseEntity.ok(emprestimoService.pagarEmprestimo(idEmprestimo, idConta));
    }
}