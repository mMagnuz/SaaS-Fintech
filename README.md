# Finora

Finora é uma aplicação acadêmica de fintech para gerenciamento financeiro pessoal. O projeto integra uma API REST em Java com Spring Boot, persistência em Oracle usando JPA e uma interface responsiva em React.

## Demonstração

O sistema oferece:

- autenticação e cadastro de usuários;
- dashboard com saldo, fatura, extrato e resumo financeiro;
- depósitos, transferências e compras parceladas;
- criação, edição, resgate e exclusão de caixinhas;
- simulação, contratação, edição, quitação e exclusão de empréstimos;
- criação, edição e exclusão de transferências agendadas;
- navegação SPA com página de erro personalizada;
- layout responsivo para desktop e dispositivos móveis.

## Tecnologias

### Backend

- Java 25
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Validation
- Oracle Database
- Maven Wrapper

### Frontend

- React
- React Router
- Vite
- JavaScript
- CSS responsivo

## Estrutura

```text
backend/
└── fintech/
    ├── database/
    ├── src/
    ├── pom.xml
    └── mvnw.cmd
frontend/
├── public/
├── src/
├── package.json
└── package-lock.json
README.md
```

## Pré-requisitos

- Java 25 ou superior;
- Node.js 20 ou superior;
- acesso à instância Oracle FIAP;
- PowerShell no Windows ou terminal equivalente.

## Configuração do backend

O backend utiliza variáveis de ambiente para não armazenar credenciais no código. Na mesma janela do PowerShell usada para iniciar a aplicação, configure:

```powershell
$env:ORACLE_URL="jdbc:oracle:thin:@oracle.fiap.com.br:1521:ORCL"
$env:ORACLE_USERNAME="seu_rm"
$env:ORACLE_PASSWORD="sua_senha_oracle"
```

Inicie a API:

```powershell
cd backend\fintech
.\mvnw.cmd spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

## Configuração do frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

A interface ficará disponível em `http://localhost:5173`.

## Usuário de teste

Crie um usuário pela tela de cadastro ou utilize um usuário existente no seu ambiente Oracle. Não são disponibilizadas credenciais reais neste repositório.

## Validação

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Backend:

```powershell
cd backend\fintech
.\mvnw.cmd test
```

## Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.
