package br.com.fiap.fintech.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_emprestimo")
public class Emprestimo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_emprestimo")
    private Long idEmprestimo;

    @Column(name = "valor_solicitado", nullable = false)
    private BigDecimal valorSolicitado;

    @Column(name = "taxa_juros", nullable = false)
    private BigDecimal taxaJuros;

    @Column(name = "quantidade_meses", nullable = false)
    private Integer quantidadeMeses;

    @Column(name = "meses_carencia", nullable = false)
    private Integer mesesCarencia = 0;

    @Column(name = "valor_total_com_juros", nullable = false)
    private BigDecimal valorTotalComJuros;

    @Column(name = "data_contratacao")
    private LocalDateTime dataContratacao = LocalDateTime.now();

    @Column(nullable = false)
    private String status = "ATIVO"; // ATIVO, QUITADO

    @ManyToOne
    @JoinColumn(name = "id_conta", nullable = false)
    private Conta conta;


    public Long getIdEmprestimo() { return idEmprestimo; }
    public void setIdEmprestimo(Long idEmprestimo) { this.idEmprestimo = idEmprestimo; }

    public BigDecimal getValorSolicitado() { return valorSolicitado; }
    public void setValorSolicitado(BigDecimal valorSolicitado) { this.valorSolicitado = valorSolicitado; }

    public BigDecimal getTaxaJuros() { return taxaJuros; }
    public void setTaxaJuros(BigDecimal taxaJuros) { this.taxaJuros = taxaJuros; }

    public Integer getQuantidadeMeses() { return quantidadeMeses; }
    public void setQuantidadeMeses(Integer quantidadeMeses) { this.quantidadeMeses = quantidadeMeses; }

    public Integer getMesesCarencia() { return mesesCarencia; }
    public void setMesesCarencia(Integer mesesCarencia) { this.mesesCarencia = mesesCarencia; }

    public BigDecimal getValorTotalComJuros() { return valorTotalComJuros; }
    public void setValorTotalComJuros(BigDecimal valorTotalComJuros) { this.valorTotalComJuros = valorTotalComJuros; }

    public LocalDateTime getDataContratacao() { return dataContratacao; }
    public void setDataContratacao(LocalDateTime dataContratacao) { this.dataContratacao = dataContratacao; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Conta getConta() { return conta; }
    public void setConta(Conta conta) { this.conta = conta; }
}