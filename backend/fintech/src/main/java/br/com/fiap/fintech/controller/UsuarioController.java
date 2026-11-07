package br.com.fiap.fintech.controller;

import br.com.fiap.fintech.model.Usuario;
import br.com.fiap.fintech.dto.DestinatarioDto;
import br.com.fiap.fintech.dto.LoginDto;
import br.com.fiap.fintech.security.LoginRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import br.com.fiap.fintech.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private LoginRateLimiter loginRateLimiter;

    @PostMapping("/criar")
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario criarUsuario(@RequestBody Usuario usuario){
        return usuarioService.criarUsuario(usuario);
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody LoginDto dto, HttpServletRequest request) {
        String key = request.getRemoteAddr() + ":" + (dto.getEmail() == null ? "" : dto.getEmail().trim().toLowerCase());
        loginRateLimiter.check(key);
        try {
            Usuario usuario = usuarioService.autenticar(dto.getEmail(), dto.getSenha());
            loginRateLimiter.clear(key);
            return usuario;
        } catch (RuntimeException exception) {
            loginRateLimiter.registerFailure(key);
            throw exception;
        }
    }

    @GetMapping("/buscar/{idUsuario}")
    @ResponseStatus(HttpStatus.OK)
    public Usuario buscarUsuario(@PathVariable Long idUsuario){
        return usuarioService.buscarUsuario(idUsuario);
    }

    @GetMapping("/listar")
    @ResponseStatus(HttpStatus.OK)
    public List<Usuario> listaUsuarios(){
        return usuarioService.listaUsuarios();
    }

    @GetMapping("/destinatario")
    @ResponseStatus(HttpStatus.OK)
    public DestinatarioDto buscarDestinatario(@RequestParam String identificador) {
        return usuarioService.buscarDestinatario(identificador);
    }

    @DeleteMapping("/deletar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletarUsuario(@RequestBody Usuario usuario){
        usuarioService.deletarUsuario(usuario.getId());
    }

    @PutMapping("/editar")
    @ResponseStatus(HttpStatus.OK)
    public Usuario atualizarUsuario(@RequestBody Usuario usuario){
        return usuarioService.atualizarUsuario(usuario);
    }
}
