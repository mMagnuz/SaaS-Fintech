package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.dto.TransferenciaAgendadaDto;
import br.com.fiap.fintech.model.TransferenciaAgendada;
import br.com.fiap.fintech.service.TransferenciaAgendadaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
public class TransferenciaAgendadaController {
    @Autowired
    private TransferenciaAgendadaService agendadaService;

    @PostMapping
    public ResponseEntity<TransferenciaAgendada> agendarTransferencia(@RequestBody TransferenciaAgendadaDto dto) {
        TransferenciaAgendada novoAgendamento = agendadaService.agendarTransferencia(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoAgendamento);
    }

    @GetMapping("/conta/{idConta}")
    public ResponseEntity<List<TransferenciaAgendada>> listarAgendamentos(@PathVariable Long idConta) {
        List<TransferenciaAgendada> lista = agendadaService.listarAgendamentosPorConta(idConta);
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/{idAgendamento}")
    public ResponseEntity<TransferenciaAgendada> atualizarAgendamento(
            @PathVariable Long idAgendamento,
            @RequestBody TransferenciaAgendadaDto dto
    ) {
        return ResponseEntity.ok(agendadaService.atualizarTransferencia(idAgendamento, dto));
    }

    @DeleteMapping("/{idAgendamento}")
    public ResponseEntity<Void> excluirAgendamento(
            @PathVariable Long idAgendamento,
            @RequestParam Long idConta
    ) {
        agendadaService.excluirTransferencia(idAgendamento, idConta);
        return ResponseEntity.noContent().build();
    }
}