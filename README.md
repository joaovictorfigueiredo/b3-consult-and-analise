# 📈 B3 & Global Invest Advisor - Consultor e Analisador de Investimentos

Aplicativo web interativo desenvolvido em Python com **Streamlit**, **Pandas**, **yfinance**, **Plotly** e **Google Gemini AI**. Funciona como um consultor e analisador pessoal de ações focado na B3 e mercado internacional.

---

## 🚀 Como Executar Localmente no VS Code

### 1. Pré-requisitos
- [Python 3.10+](https://www.python.org/downloads/)
- [VS Code](https://code.visualstudio.com/) com a extensão **Python** instalada

### 2. Clonar ou Abrir a Pasta no VS Code
Abra a pasta do projeto no VS Code e abra o terminal integrado (`Ctrl + ~`).

### 3. Criar e Ativar o Ambiente Virtual (Recomendado)
```bash
# Criar ambiente virtual
python -m venv venv

# Ativar no Windows (PowerShell):
.\venv\Scripts\activate

# Ativar no Windows (CMD):
.\venv\Scripts\activate.bat

# Ativar no Linux / Mac:
source venv/bin/activate
```

### 4. Instalar as Dependências
```bash
pip install -r requirements.txt
```
*Ou instale individualmente:*
```bash
pip install streamlit pandas yfinance plotly google-genai python-dotenv
```

### 5. Configurar a Chave da API do Google Gemini
1. Obtenha sua chave gratuita no [Google AI Studio](https://aistudio.google.com/).
2. Crie um arquivo chamado `.env` na raiz do projeto contendo:
```env
GEMINI_API_KEY="sua_chave_do_google_ai_studio_aqui"
```
*(Ou defina a variável de ambiente no seu terminal)*:
- **Windows (PowerShell):** `$env:GEMINI_API_KEY="sua_chave"`
- **Linux/Mac:** `export GEMINI_API_KEY="sua_chave"`

### 6. Iniciar o Aplicativo
```bash
streamlit run app.py
```

O aplicativo iniciará automaticamente no navegador nos seguintes endereços:
- **Local:** `http://localhost:8501`
- **Rede Local:** `http://<seu-ip-local>:8501` *(para acessar pelo celular ou outro computador na mesma rede Wi-Fi)*

---

## 🗂️ Estrutura Funcional do Aplicativo (st.tabs)

1. **📊 Visão Geral da Carteira:**
   - **Barra Lateral Dinâmica:** Cadastre e exclua ativos informando Ticker (ex: `PETR4.SA`, `VALE3.SA`, `AAPL`), Quantidade e Preço Médio.
   - **Cálculos Automáticos:** Preço Atual em tempo real via `yfinance`, Valor Total da Posição, Lucro/Prejuízo (R$ e %) com indicadores visuais delta, e Preço Médio.
   - **Gráfico Interativo:** Histórico recente de preços com filtros de período (1M, 3M, 6M, 1A, 5A) e linha de referência do seu Preço Médio.
   - **Gráfico de Alocação:** Donut Chart de distribuição percentual da carteira.

2. **📈 Relatórios Mensais e Anuais:**
   - Consolidação de desempenho e simulador de aportes periódicos.
   - Projeção de valorização e efeito multiplicador do reinvestimento de dividendos.
   - Gráfico comparativo de Patrimônio Acumulado vs Total Aportado e tabela anualizada de fechamentos.

3. **🤖 Assistente de IA Integrado (API do Gemini):**
   - Análise fundamentalista e estratégica da sua carteira em tempo real com o modelo `gemini-3.8-flash`.
   - Avaliação de risco, concentração setorial e correlação com taxa Selic, juros do Fed e inflação.
   - Botões com perguntas frequentes e suporte à tomada de decisão sem ordens diretas de compra/venda.
