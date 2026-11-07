package br.com.fiap.fintech.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "t_conta")
public class Conta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conta")
    private Long idConta;

    private BigDecimal saldo = BigDecimal.ZERO;
    private BigDecimal fatura = BigDecimal.ZERO;
    private BigDecimal emprestimo = BigDecimal.ZERO;

    @Column(name = "limite_credito" )
    private BigDecimal limiteCredito = BigDecimal.ZERO;


    @OneToOne
    @JoinColumn(name = "t_usuario_id", nullable = false)
    private Usuario usuario;

    public Conta(){}
    public Conta(Long idConta, BigDecimal saldo, BigDecimal fatura, BigDecimal emprestimo, BigDecimal limiteCredito){
        this.idConta = idConta;
        this.saldo = saldo;
        this.fatura = fatura;
        this.emprestimo = emprestimo;
        this.limiteCredito = limiteCredito;
        this.usuario = new Usuario();
    }


    public Long getIdConta() {
        return idConta;
    }
    public void setIdConta(Long idConta) {
        this.idConta = idConta;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }
    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public BigDecimal getFatura() {
        return fatura;
    }
    public void setFatura(BigDecimal fatura) {
        this.fatura = fatura;
    }

    public BigDecimal getEmprestimo() {
        return emprestimo;
    }
    public void setEmprestimo(BigDecimal emprestimo) {
        this.emprestimo = emprestimo;
    }

    public BigDecimal getLimiteCredito() {
        return limiteCredito;
    }
    public void setLimiteCredito(BigDecimal limiteCredito) {
        this.limiteCredito = limiteCredito;
    }

    public Usuario getUsuario() {
        return usuario;
    }
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}
