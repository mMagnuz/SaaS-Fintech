package br.com.fiap.fintech.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_transferencia_agendada")
public class TransferenciaAgendada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agendamento")
    private Long idAgendamento;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(name = "data_hora_agendada", nullable = false)
    private LocalDateTime dataHoraAgendada;

    @Column(nullable = false)
    private String status = "PENDENTE";

    @ManyToOne
    @JoinColumn(name = "id_conta_origem", nullable = false)
    private Conta contaOrigem;

    @ManyToOne
    @JoinColumn(name = "id_conta_destino", nullable = false)
    private Conta contaDestino;


    public Long getIdAgendamento() { return idAgendamento; }
    public void setIdAgendamento(Long idAgendamento) { this.idAgendamento = idAgendamento; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDateTime getDataHoraAgendada() { return dataHoraAgendada; }
    public void setDataHoraAgendada(LocalDateTime dataHoraAgendada) { this.dataHoraAgendada = dataHoraAgendada; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Conta getContaOrigem() { return contaOrigem; }
    public void setContaOrigem(Conta contaOrigem) { this.contaOrigem = contaOrigem; }

    public Conta getContaDestino() { return contaDestino; }
    public void setContaDestino(Conta contaDestino) { this.contaDestino = contaDestino; }
}