package br.com.fiap.fintech.dto;

import java.math.BigDecimal;

public class CaixinhaDto {
    private Long idConta;
    private String nome; //Criar ou identificar caixinha
    private BigDecimal valor;
    private BigDecimal meta;


    public Long getIdConta() {
        return idConta;
    }
    public void setIdConta(Long idConta) {
        this.idConta = idConta;
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getValor() {
        return valor;
    }
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public BigDecimal getMeta() {
        return meta;
    }

    public void setMeta(BigDecimal meta) {
        this.meta = meta;
    }
}
