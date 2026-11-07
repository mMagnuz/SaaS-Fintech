package br.com.fiap.fintech.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransferenciaAgendadaDto {
    private Long idContaOrigem;
    private Long idContaDestino;
    private BigDecimal valor;
    private LocalDateTime dataHoraAgendada;


    public Long getIdContaOrigem() { return idContaOrigem; }
    public void setIdContaOrigem(Long idContaOrigem) { this.idContaOrigem = idContaOrigem; }

    public Long getIdContaDestino() { return idContaDestino; }
    public void setIdContaDestino(Long idContaDestino) { this.idContaDestino = idContaDestino; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDateTime getDataHoraAgendada() { return dataHoraAgendada; }
    public void setDataHoraAgendada(LocalDateTime dataHoraAgendada) { this.dataHoraAgendada = dataHoraAgendada; }
}