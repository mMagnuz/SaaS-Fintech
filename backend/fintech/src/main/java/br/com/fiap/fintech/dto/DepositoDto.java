package br.com.fiap.fintech.dto;

import java.math.BigDecimal;

public class DepositoDto {
    private Long idConta;
    private BigDecimal valor;

    public Long getIdConta() {
        return idConta;
    }
    public void setIdConta(Long idConta) {
        this.idConta = idConta;
    }

    public BigDecimal getValor() {
        return valor;
    }
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
