package br.com.fiap.fintech.dto;

import java.math.BigDecimal;

public class EmprestimoDto {
    private Long idConta;
    private BigDecimal valorSolicitado;
    private BigDecimal taxaJuros; // Ex: 0.02 (2%)
    private Integer quantidadeMeses;
    private Integer mesesCarencia;


    public Long getIdConta() { return idConta; }
    public void setIdConta(Long idConta) { this.idConta = idConta; }

    public BigDecimal getValorSolicitado() { return valorSolicitado; }
    public void setValorSolicitado(BigDecimal valorSolicitado) { this.valorSolicitado = valorSolicitado; }

    public BigDecimal getTaxaJuros() { return taxaJuros; }
    public void setTaxaJuros(BigDecimal taxaJuros) { this.taxaJuros = taxaJuros; }

    public Integer getQuantidadeMeses() { return quantidadeMeses; }
    public void setQuantidadeMeses(Integer quantidadeMeses) { this.quantidadeMeses = quantidadeMeses; }

    public Integer getMesesCarencia() { return mesesCarencia; }
    public void setMesesCarencia(Integer mesesCarencia) { this.mesesCarencia = mesesCarencia; }
}