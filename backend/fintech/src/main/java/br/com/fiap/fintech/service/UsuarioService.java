package br.com.fiap.fintech.service;

import br.com.fiap.fintech.model.Conta;
import br.com.fiap.fintech.model.Usuario;
import br.com.fiap.fintech.dto.DestinatarioDto;
import br.com.fiap.fintech.repository.ContaRepository;
import br.com.fiap.fintech.repository.UsuarioRepository;
import br.com.fiap.fintech.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ContaRepository contaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario criarUsuario(Usuario usuario){
        // Criptografa a senha em texto puro antes de persistir no Oracle
        String senhaCriptografada = passwordEncoder.encode(usuario.getSenha());
        usuario.setSenha(senhaCriptografada);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        // Criar a conta automaticamente vinculada a este usuário
        Conta novaConta = new Conta();
        novaConta.setSaldo(BigDecimal.ZERO);
        novaConta.setLimiteCredito(new BigDecimal("1000.00"));
        novaConta.setUsuario(usuarioSalvo);

        contaRepository.save(novaConta);

        return usuarioSalvo;
    }

    public Usuario atualizarUsuario(Usuario usuario){
        Usuario existente = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        existente.setNome(usuario.getNome());
        existente.setCpf(usuario.getCpf());
        existente.setCelular(usuario.getCelular());
        existente.setDataNascimento(usuario.getDataNascimento());
        if (usuario.getSenha() != null && !usuario.getSenha().isBlank()) {
            existente.setSenha(passwordEncoder.encode(usuario.getSenha()));
        }
        return usuarioRepository.save(existente);
    }

    public Usuario buscarUsuario (Long id){
        Optional<Usuario> usuario = usuarioRepository.findById(id);

        if(usuario.isPresent()){
            return usuario.get();
        } else {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
    }

    public List<Usuario> listaUsuarios(){
        return usuarioRepository.findAll();
    }

    public Usuario autenticar(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("E-mail ou senha inválidos"));
        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new RuntimeException("E-mail ou senha inválidos");
        }
        return usuario;
    }

    public DestinatarioDto buscarDestinatario(String identificador) {
        if (identificador == null || identificador.isBlank()) {
            throw new RuntimeException("Informe nome, celular, CPF ou número da conta");
        }

        String termo = identificador.trim();
        String somenteNumeros = termo.replaceAll("\\D", "");
        Usuario usuarioEncontrado = usuarioRepository.findAll().stream()
                .filter(usuario -> corresponde(usuario, termo, somenteNumeros)
                        || contaRepository.findByUsuarioId(usuario.getId()).stream()
                        .anyMatch(conta -> String.valueOf(conta.getIdConta()).equals(termo)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nenhum usuário encontrado com esse identificador"));

        Conta conta = contaRepository.findByUsuarioId(usuarioEncontrado.getId()).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("O usuário encontrado ainda não possui uma conta"));

        return new DestinatarioDto(
                usuarioEncontrado.getId(),
                conta.getIdConta(),
                usuarioEncontrado.getNome(),
                usuarioEncontrado.getCpf(),
                usuarioEncontrado.getCelular()
        );
    }

    private boolean corresponde(Usuario usuario, String termo, String somenteNumeros) {
        return (usuario.getNome() != null && usuario.getNome().equalsIgnoreCase(termo))
                || (usuario.getCpf() != null && usuario.getCpf().equalsIgnoreCase(termo))
                || (usuario.getCelular() != null && usuario.getCelular().equalsIgnoreCase(termo))
                || (usuario.getCpf() != null && !somenteNumeros.isBlank()
                    && usuario.getCpf().replaceAll("\\D", "").equals(somenteNumeros))
                || (usuario.getCelular() != null && !somenteNumeros.isBlank()
                    && usuario.getCelular().replaceAll("\\D", "").equals(somenteNumeros));
    }

    public void deletarUsuario(Long id){
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        if(usuario.isPresent()){
            usuarioRepository.delete(usuario.get());
        } else {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
    }
}
