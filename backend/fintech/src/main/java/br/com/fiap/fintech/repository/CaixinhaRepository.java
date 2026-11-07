package br.com.fiap.fintech.repository;

import br.com.fiap.fintech.model.Caixinha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaixinhaRepository extends JpaRepository<Caixinha, Long> {
    List<Caixinha> findByContaIdConta(Long idConta);
}