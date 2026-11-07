package br.com.fiap.fintech.dto;

import java.math.BigDecimal;

public class CompraParceladaDto {
    private Long idConta;
    private String descricao;
    private BigDecimal valor;
    private Integer parcelas;


    public Long getIdConta() {
        return idConta;
    }
    public void setIdConta(Long idConta) {
        this.idConta = idConta;
    }

    public String getDescricao() {
        return descricao;
    }
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Integer getParcelas() {
        return parcelas;
    }
    public void setParcelas(Integer parcelas) {
        this.parcelas = parcelas;
    }
}
