package br.com.fiap.fintech.repository;

import br.com.fiap.fintech.model.TransferenciaAgendada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferenciaAgendadaRepository extends JpaRepository<TransferenciaAgendada, Long> {

    List<TransferenciaAgendada> findByContaOrigemIdConta(Long idConta);

    @Query("SELECT t FROM TransferenciaAgendada t WHERE t.status = 'PENDENTE' AND t.dataHoraAgendada <= :agora")
    List<TransferenciaAgendada> findTransferenciasPendentes(@Param("agora") LocalDateTime agora);
}