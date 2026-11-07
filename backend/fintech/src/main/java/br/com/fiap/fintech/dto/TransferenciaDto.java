//DTO é uma convenção de arquitetura usada para agrupar classes que transferem dados entre diferentes camadas de um sistema.
package br.com.fiap.fintech.dto;

import java.math.BigDecimal;

public class TransferenciaDto {
    private Long idContaOrigem;
    private Long idContaDestino;
    private BigDecimal valor;


    public Long getIdContaOrigem() {
        return idContaOrigem;
    }
    public void setIdContaOrigem(Long idContaOrigem) {
        this.idContaOrigem = idContaOrigem;
    }

    public Long getIdContaDestino() {
        return idContaDestino;
    }
    public void setIdContaDestino(Long idContaDestino) {
        this.idContaDestino = idContaDestino;
    }

    public BigDecimal getValor() {
        return valor;
    }
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}