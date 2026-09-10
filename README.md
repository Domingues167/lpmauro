# Landing Page - Sistema de Captação Automática ™️

Landing page de alta conversão desenvolvida para **Agências de Viagens e Consultorias de Turismo**, voltada para agências que faturam acima de R$ 100 mil/mês.

---

## 🚀 Principais Recursos
- **Design Moderno:** Identidade visual premium em Azul Elétrico / Royal Blue (`#0066FF`), glassmorphism e tipografia Plus Jakarta Sans.
- **Carrossel em Linha Reta & Player Inline:** 10 vídeos reais de depoimentos passando continuamente em carrossel horizontal com autoplay, suporte a arrastar e reprodução instantânea **direto no player do site** (inline, sem popups ou modais).
- **Captura Qualificada de Leads:**
  - Nome completo
  - WhatsApp com máscara e DDD
  - Instagram da agência
  - Faturamento atual
  - Quantidade de vendedores na equipe
- **Integração CRM People (Webhook):** Disparo automático de todos os dados do lead (nome, telefone, whatsapp, instagram, faturamento, vendedores, UTMs de campanha, página e timestamp) diretamente para o CRM People via Generic Webhook.
- **Integração WhatsApp (11 96609-7451):** Redirecionamento instantâneo com mensagem formatada para atendimento humano imediato.
- **Versão WordPress Pronta:** Arquivo único com todo o CSS, JS e imagens embutidas em Base64 para uso direto no Elementor ou bloco HTML do Gutenberg.

---

## 📁 Estrutura dos Arquivos
- **`index.html`**: Página principal modular (HTML + CSS externo + JS externo).
- **`wordpress-pagina.html`**: Página 100% autossuficiente para WordPress (CSS inline, JS inline e imagens embutidas em Base64).
- **`obrigado1.html` / `wordpress-obrigado1.html`**: Página de obrigado para diagnóstico inicial.
- **`obrigado2.html` / `wordpress-obrigado2.html`**: Página de obrigado VIP para agências qualificadas.
- **`css/style.css`**: Design system completo e responsivo.
- **`js/main.js`**: Scripts de validação, rastreamento de UTMs, máscara de telefone e carrossel.
- **`Logo20RX_converted-1.webp`**: Logotipo oficial da marca.
- **Vídeos (`*.mp4`)**: Vídeos dos depoimentos dos clientes (gerenciados via Git LFS).

---

## 💻 Como Visualizar Localmente
Basta abrir o arquivo `index.html` ou `wordpress-pagina.html` em qualquer navegador, ou iniciar um servidor local:
```bash
python -m http.server 3333
```
Acesse no navegador: `http://localhost:3333/`
