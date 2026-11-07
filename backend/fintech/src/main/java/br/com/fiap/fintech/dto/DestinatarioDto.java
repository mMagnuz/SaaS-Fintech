package br.com.fiap.fintech.dto;

public class DestinatarioDto {
    private Long idUsuario;
    private Long idConta;
    private String nome;
    private String cpf;
    private String celular;

    public DestinatarioDto() {
    }
    public DestinatarioDto(Long idUsuario, Long idConta, String nome, String cpf, String celular) {
        this.idUsuario = idUsuario;
        this.idConta = idConta;
        this.nome = nome;
        this.cpf = cpf;
        this.celular = celular;
    }


    public Long getIdUsuario() {
        return idUsuario;
    }
    public Long getIdConta() {
        return idConta;
    }

    public String getNome() {
        return nome;
    }
    public String getCpf() {
        return cpf;
    }

    public String getCelular() {
        return celular;
    }
}
