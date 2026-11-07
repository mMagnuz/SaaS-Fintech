package br.com.fiap.fintech.repository;

import br.com.fiap.fintech.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    @Query("SELECT t FROM Transacao t WHERE t.contaOrigem.idConta = :idConta OR t.contaDestino.idConta = :idConta")
    List<Transacao> buscarExtratoPorConta(@Param("idConta") Long idConta);
}