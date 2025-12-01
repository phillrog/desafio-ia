### O Desafio e a Solução: Pronail

#### O Problema

Muitas plataformas de agendamento online são inflexíveis, exigindo que o usuário navegue por formulários complexos para encontrar o que precisa. E se o processo fosse tão **simples quanto conversar** com um assistente atencioso?

#### A Solução: Pronail

O Pronail é um sistema web que transforma o agendamento de serviços de beleza em uma experiência de chat intuitiva. Ele utiliza **IA Conversacional** (GPT-4o-mini) para entender a intenção do cliente, consultar dados do sistema (como a disponibilidade de profissionais) e, finalmente, realizar o agendamento por meio de **funções disparadas (Function Calling)**.

<img width="1918" height="965" alt="image" src="https://github.com/user-attachments/assets/3d966ce3-e1e8-43d7-be62-24041ac4c820" />

### A Pilha Tecnológica

<img width="1255" height="423" alt="Captura de tela 2025-12-01 180111" src="https://github.com/user-attachments/assets/777adf79-5948-46f3-a41b-2309f37b4077" />


A aplicação é dividida em duas grandes áreas: o **Frontend (Cliente)** e o **Backend (Serverless AWS)**.

<img width="803" height="589" alt="Captura de tela 2025-12-01 180515" src="https://github.com/user-attachments/assets/b2889dc5-e3ff-4cfb-9fce-34eeedaa1b9a" />

#### O Serviço `User` (Autenticação)

O `serverless.yml` do serviço `user` revela o uso de:

-   **AWS Cognito (**`**UserPool**`**,** `**UserClient**`**):** Usado para gerenciar o registro e login dos usuários, garantindo endpoints como `/login` e `/register`. Isso retira a complexidade da gestão de senhas e autenticação.
-   **AWS DynamoDB (**`**UsersTable**`**):** Armazena informações adicionais do usuário. Note a utilização de **Índices Secundários Globais (GSI -** `**CognitoIdIndex**`**,** `**EmailIndex**`**)**, que são cruciais para permitir consultas rápidas por campos que não são a chave primária (`id`).
-   **AWS Lambda Functions:** Funções simples (como `createUser`, `login e register`) ativadas via **AWS HTTP API** para gerenciar o ciclo de vida do usuário.

#### O Serviço `AI-Interaction`: O Coração Inteligente

Este serviço é a peça central do artigo, demonstrando como a IA é integrada:

1.  **Conectores de Dados (RAG):** O serviço `AIInteractionService` usa **Function Calling** (mecanismo que simula RAG) para expor as capacidades do sistema ao GPT-4o-mini, como:

-   `get_available_technicians`: Consulta o DynamoDB via `technicianService.list()`.
-   `create_booking`: Realiza o agendamento no sistema via `bookingService.create()`.

**2\. O Fluxo de Diálogo e Ação:**

-   O usuário envia uma mensagem (ex: "Quero agendar manicure amanhã às 10h").
-   O handler `virtualAssistant` envia a conversa e a **definição das ferramentas** (`get_available_technicians`, `create_booking`) para o GPT-4o-mini.
-   O modelo da OpenAI decide se precisa usar uma função. Se decidir usar `create_booking`, ele retorna o nome da função e os argumentos (ex: `technicianId`, `dateTime`).
-   O backend do Pronail **executa a função real** (chama o `bookingService`).
-   O resultado da função é enviado de volta ao GPT-4o-mini para que ele gere a **resposta final amigável** para o usuário.


# Como rodar ?
Criar uma instância na AWS, configurar AWS Cli e Node 18+. Exemplo: instância m7i-flex.large em us-east-1d Ubuntu 24.04.3 LTS

## Passo 1: Instalando Dependências 
Executar ```npm install``` na pasta backend

```bash
cd pronail/backend
npm install
```

## Passo 2: Instalando Dependências para demais Serviços
Executar ```npm install``` nos demais serviços.

```bash
for service in services/*; do (cd "$service" && npm install) done
```

<img width="1302" height="527" alt="image" src="https://github.com/user-attachments/assets/623a72b8-2fe1-454d-bfc4-e8e02d11fee4" />


## Passo 3: Configurando as Credenciais da OpenAI API Key & Assistant



### Crie um assistente e uma app key na openai:

https://platform.openai.com/api-keys

<img width="1917" height="620" alt="image" src="https://github.com/user-attachments/assets/d5be5eb1-42bc-4001-b6d8-ec259487c6e5" />

Copie a chave do assistente

<img width="1918" height="957" alt="image" src="https://github.com/user-attachments/assets/41e48ed1-b450-4d04-9c6a-f0eeefc4d188" />


### Configure System instructions do assistente:

```
Você é um agente de inteligência artificial integrado à plataforma ProNail. Seu objetivo é realizar atendimento ao cliente e auxiliar no agendamento de serviços (Manicure, Pedicure, Maquiagem, etc...) relacioandos a beleza de forma eficiente, utilizando a API OpenAI, chamadas de API (Functions) e técnicas RAG (Retrieval Augmented Generation) para fornecer respostas precisas e relevantes. Mantenha sempre um tom amigável, profissional e claro em suas interações.
```


### Adicione as seguintes variáveis de ambiente:

**AI Interaction Service**

```bash
nano src/services/ai-interaction-service/serverless.yml
```

<img width="928" height="33" alt="image" src="https://github.com/user-attachments/assets/cc5e82c5-e4b9-4549-b947-d4c78e84aca1" />

```
environment:
  OPEN_AI_KEY: "your-openai-key"
  ASSISTANT_ID: "your-assistant-id"
```

<img width="1896" height="602" alt="image" src="https://github.com/user-attachments/assets/c86a6c8d-c85e-4bd8-b616-67ec98dba684" />


### Deploy
Execute:

```
npm run deploy
```

Obs: Aguarde 5~15 minutos

<img width="696" height="285" alt="image" src="https://github.com/user-attachments/assets/c8f4d3eb-9103-4e57-af71-2ccae0f3e833" />

---

## Passo 4: Configurar o gateway no frontend
Execute:

```
cd ../frontend
npm install
cp .env.example .env && nano .env
```

Vá em Api Gateway e copie o endereço URL

<img width="1512" height="548" alt="image" src="https://github.com/user-attachments/assets/c3840f6c-bbd5-4e7c-a6f9-b0ccb6d293ed" />

<img width="978" height="197" alt="image" src="https://github.com/user-attachments/assets/6fffb5e5-ddef-4ca7-9a71-8f46652dea80" />

<img width="855" height="460" alt="image" src="https://github.com/user-attachments/assets/14d78d25-0d97-4faf-a40a-5b0f0ec37b7c" />

Execute comando aws para pegar o ip público em seguida executar a aplicação
```
# You can use this command line bellow to get your EC2 Workstation Instance Public IP Address:
aws ec2 describe-instances | grep -i PublicIpAddress

# Running Serverless Application:
npm run dev -- --host
```


# Resultado

![agendamento1](https://github.com/user-attachments/assets/acdabcb5-a9ec-455a-9230-701cd80fce32)

![agendamento2](https://github.com/user-attachments/assets/a0ef39b5-f2e4-4ca8-871f-065aa20cb353)


Login
<img width="1918" height="965" alt="image" src="https://github.com/user-attachments/assets/3d966ce3-e1e8-43d7-be62-24041ac4c820" />

Cadastro
<img width="1913" height="968" alt="image" src="https://github.com/user-attachments/assets/c6be4b2b-6c62-4e41-950f-e551b8e55667" />

Home
<img width="1918" height="957" alt="image" src="https://github.com/user-attachments/assets/28809f77-5111-44bd-8e89-f0620ecf6c62" />

Assistente
<img width="1918" height="965" alt="image" src="https://github.com/user-attachments/assets/94ac8a83-840d-4184-b342-ce5ada4e6a94" />

Buscar profissional disponível ```get_available_technicians```
![agendamento1](https://github.com/user-attachments/assets/965e9889-e862-4d5e-82be-660dd1f4ce53)

Agendar horário ```create_booking```
<img width="1918" height="972" alt="image" src="https://github.com/user-attachments/assets/981cde2e-20bf-4685-9361-1c8e0567cc29" />

<img width="1912" height="915" alt="image" src="https://github.com/user-attachments/assets/26cf9f49-39f7-4478-8b5a-24a71f8f2838" />


Dynamo
<img width="1907" height="592" alt="image" src="https://github.com/user-attachments/assets/cd96c459-46f9-483c-90da-44be2f1ba35c" />

Cognito
<img width="1902" height="586" alt="image" src="https://github.com/user-attachments/assets/fcad23c7-b504-4107-bc4b-ffadaf4500dd" />

Apis
<img width="1913" height="636" alt="image" src="https://github.com/user-attachments/assets/a00f45d5-b892-4601-be20-0c47b2e95cc1" />

Cloud Watch Logs

<img width="1913" height="840" alt="image" src="https://github.com/user-attachments/assets/2b5f17df-702b-4fb2-9fad-51e403453b49" />


# Excluir recursos
pare a execução do frontend e execute.

```
cd ../backup

npx serverless remove 
```
Obs: Execute até que apareça a seguinte mensagem para todos os serviços "Stack 'x-dev' does not exist". Exemplo: Stack 'technician-dev' does not exist

<img width="991" height="650" alt="image" src="https://github.com/user-attachments/assets/62f69cea-e0ad-412b-9a77-4be9dc67a472" />

- Confira o API Gateway, CLoud Watch, Dynamos e por fim termine a instância










