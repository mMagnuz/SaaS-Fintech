package br.com.fiap.fintech.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_transacao")
public class Transacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transacao")
    private Long idTransacao;

    private String tipo; // "DEPOSITO" ou "TRANSFERENCIA"

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(name = "data_hora")
    private LocalDateTime dataHora = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_conta_origem")
    private Conta contaOrigem; // Nulo em caso de depósito

    @ManyToOne
    @JoinColumn(name = "id_conta_destino")
    private Conta contaDestino; // Conta que recebe o depósito ou a transferência


    public Long getIdTransacao() { return idTransacao; }
    public void setIdTransacao(Long idTransacao) { this.idTransacao = idTransacao; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Conta getContaOrigem() { return contaOrigem; }
    public void setContaOrigem(Conta contaOrigem) { this.contaOrigem = contaOrigem; }

    public Conta getContaDestino() { return contaDestino; }
    public void setContaDestino(Conta contaDestino) { this.contaDestino = contaDestino; }

    @Transient
    public String getNomeRemetente() {
        if (contaOrigem == null || contaOrigem.getUsuario() == null) {
            return null;
        }
        return contaOrigem.getUsuario().getNome();
    }

    @Transient
    public String getNomeDestinatario() {
        if (contaDestino == null || contaDestino.getUsuario() == null) {
            return null;
        }
        return contaDestino.getUsuario().getNome();
    }
}