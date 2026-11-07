package br.com.fiap.fintech.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "t_caixinha")
public class Caixinha {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_caixinha")
    private Long idCaixinha;

    @Column(nullable = false)
    private String nome;

    @Column(name = "valor_guardado", nullable = false)
    private BigDecimal valorGuardado =  BigDecimal.ZERO;

    @Transient
    private BigDecimal meta;

    @ManyToOne
    @JoinColumn(name = "id_conta", nullable = false)
    private Conta conta;


    public Long getIdCaixinha() {
        return idCaixinha;
    }
    public void setIdCaixinha(Long idCaixinha) {
        this.idCaixinha = idCaixinha;
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getValorGuardado() {
        return valorGuardado;
    }
    public void setValorGuardado(BigDecimal valorGuardado) {
        this.valorGuardado = valorGuardado;
    }

    public Conta getConta() {
        return conta;
    }
    public void setConta(Conta conta) {
        this.conta = conta;
    }

    public BigDecimal getMeta() {
        return meta;
    }

    public void setMeta(BigDecimal meta) {
        this.meta = meta;
    }
}
