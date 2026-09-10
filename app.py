"""
=============================================================================
💼 B3 & GLOBAL INVEST - CONSULTOR E ANALISADOR DE INVESTIMENTOS PESSOAL
=============================================================================
Aplicativo web interativo desenvolvido em Python com Streamlit, Pandas,
yfinance e Google Gemini AI.

COMO CONFIGURAR E EXECUTAR NO VS CODE:
-----------------------------------------------------------------------------
1. Instale as dependências necessárias no seu terminal:
   $ pip install -r requirements.txt
   ou individualmente:
   $ pip install streamlit pandas yfinance plotly google-genai python-dotenv

2. Configure a sua chave da API do Google Gemini:
   Opção A: Crie um arquivo '.env' na mesma pasta deste arquivo com:
            GEMINI_API_KEY="sua_chave_do_google_ai_studio_aqui"
   Opção B: Defina no terminal antes de rodar:
            (Linux/Mac) export GEMINI_API_KEY="sua_chave_aqui"
            (Windows CMD) set GEMINI_API_KEY="sua_chave_aqui"
            (Windows PowerShell) $env:GEMINI_API_KEY="sua_chave_aqui"
   Opção C: Crie '.streamlit/secrets.toml' com:
            GEMINI_API_KEY = "sua_chave_aqui"

3. Execute o aplicativo no terminal do VS Code:
   $ streamlit run app.py

4. Acesso:
   - Local: http://localhost:8501
   - Rede local (para acessar pelo celular ou outro PC): http://<seu_ip_local>:8501
=============================================================================
"""

import os
import datetime
from typing import Dict, Any, List
import streamlit as st
import pandas as pd
import yfinance as yf
import plotly.express as px
import plotly.graph_objects as go
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env se existir
load_dotenv()

# =============================================================================
# CONFIGURAÇÃO GERAL DA PÁGINA STREAMLIT
# =============================================================================
st.set_page_config(
    page_title="B3 & Global Invest Advisor",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =============================================================================
# ESTILIZAÇÃO CSS CUSTOMIZADA (TEMA ESCURO PROFISSIONAL & MODERNO)
# =============================================================================
DARK_THEME_CSS = """
<style>
    /* Estilização Geral do Fundo */
    .stApp {
        background-color: #0b0f19;
        color: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Ocultar barra padrão de menu e rodapé para visual de software nativo */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Sidebar personalizada */
    section[data-testid="stSidebar"] {
        background-color: #111827;
        border-right: 1px solid #1f2937;
    }
    
    /* Abas estilizadas */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #111827;
        padding: 8px 12px;
        border-radius: 12px;
        border: 1px solid #1f2937;
    }
    .stTabs [data-baseweb="tab"] {
        height: 44px;
        white-space: pre-wrap;
        border-radius: 8px;
        color: #9ca3af;
        font-weight: 600;
        padding: 0 16px;
        transition: all 0.2s ease;
    }
    .stTabs [aria-selected="true"] {
        background-color: #1e3a8a !important;
        color: #60a5fa !important;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }

    /* Cartões de Métricas Personalizados */
    .metric-card {
        background: linear-gradient(145deg, #161f30 0%, #111827 100%);
        border: 1px solid #1f2937;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        margin-bottom: 12px;
        transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .metric-card:hover {
        border-color: #374151;
        transform: translateY(-2px);
    }
    .metric-title {
        color: #9ca3af;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
    }
    .metric-value {
        color: #f9fafb;
        font-size: 1.85rem;
        font-weight: 700;
        line-height: 1.2;
    }
    .metric-delta {
        font-size: 0.95rem;
        font-weight: 600;
        margin-top: 6px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
    .delta-positive {
        color: #10b981;
    }
    .delta-negative {
        color: #ef4444;
    }

    /* Alertas e Avisos */
    .disclaimer-box {
        background-color: #1f2937;
        border-left: 4px solid #3b82f6;
        padding: 14px 18px;
        border-radius: 6px;
        font-size: 0.85rem;
        color: #d1d5db;
        margin: 15px 0;
    }
    
    /* Botões personalizados */
    .stButton > button {
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s;
    }

    /* Regras de Impressão (PDF / Impressora) */
    @media print {
        header, footer, section[data-testid="stSidebar"], .stTabs [data-baseweb="tab-list"], .no-print, button {
            display: none !important;
        }
        .stApp {
            background-color: #ffffff !important;
            color: #000000 !important;
        }
        .metric-card {
            background: #ffffff !important;
            border: 1px solid #d1d5db !important;
            color: #111827 !important;
            box-shadow: none !important;
        }
        .metric-value {
            color: #111827 !important;
        }
        .metric-title {
            color: #4b5563 !important;
        }
        .print-header {
            display: block !important;
        }
    }
    .print-header {
        display: none;
    }
</style>
"""
st.markdown(DARK_THEME_CSS, unsafe_allow_html=True)

# =============================================================================
# INICIALIZAÇÃO DO ESTADO DA SESSÃO (SESSION STATE)
# =============================================================================
DEFAULT_PORTFOLIO = [
    {"ticker": "PETR4.SA", "quantidade": 100, "preco_medio": 32.50},
    {"ticker": "VALE3.SA", "quantidade": 80, "preco_medio": 62.00},
    {"ticker": "ITUB4.SA", "quantidade": 150, "preco_medio": 30.20},
    {"ticker": "WEGE3.SA", "quantidade": 60, "preco_medio": 48.00},
    {"ticker": "AAPL", "quantidade": 10, "preco_medio": 185.00}
]

if "portfolio" not in st.session_state:
    st.session_state.portfolio = list(DEFAULT_PORTFOLIO)

if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {
            "role": "assistant",
            "content": (
                "👋 Olá! Eu sou o seu **Consultor de Investimentos Inteligente**, "
                "alimentado pela IA do Google Gemini.\n\n"
                "Analiso os ativos da sua carteira (B3 e Mercado Global), estrutura de alocação, "
                "risco de concentração, e forneço feedbacks estratégicos com base em tendências macroeconômicas.\n\n"
                "Como posso ajudar a estruturar suas decisões de longo prazo hoje?"
            )
        }
    ]

# =============================================================================
# FUNÇÕES AUXILIARES DE COTAÇÃO (YFINANCE) COM TRATAMENTO DE ERROS E CACHE
# =============================================================================
def normalize_b3_ticker(raw_ticker: str) -> str:
    """Normaliza o ticker adicionando .SA para ações brasileiras da B3 caso necessário."""
    clean = raw_ticker.strip().upper()
    import re
    if re.match(r"^[A-Z]{4}(3|4|5|6|11|12|34)$", clean):
        return f"{clean}.SA"
    return clean

@st.cache_data(ttl=120, show_spinner=False)
def fetch_ticker_data(ticker_symbol: str) -> Dict[str, Any]:
    """
    Busca cotação em tempo real e histórico recente via yfinance.
    Contém tratamento defensivo contra falhas de conexão e tickers inválidos.
    """
    clean_ticker = normalize_b3_ticker(ticker_symbol)
    try:
        t = yf.Ticker(clean_ticker)
        # Tenta pegar informações rápidas em tempo real
        info = t.fast_info
        
        current_price = getattr(info, "last_price", None)
        prev_close = getattr(info, "previous_close", None)
        day_high = getattr(info, "day_high", None)
        day_low = getattr(info, "day_low", None)
        volume = getattr(info, "last_volume", None)
        currency = getattr(info, "currency", "BRL" if ".SA" in clean_ticker else "USD")
        
        # Se fast_info não retornar preço, busca no histórico diário
        if current_price is None or pd.isna(current_price) or current_price <= 0:
            hist_1d = t.history(period="5d")
            if not hist_1d.empty:
                current_price = float(hist_1d["Close"].iloc[-1])
                if len(hist_1d) >= 2:
                    prev_close = float(hist_1d["Close"].iloc[-2])
                else:
                    prev_close = current_price
                if "High" in hist_1d.columns:
                    day_high = float(hist_1d["High"].iloc[-1])
                if "Low" in hist_1d.columns:
                    day_low = float(hist_1d["Low"].iloc[-1])
                if "Volume" in hist_1d.columns:
                    volume = int(hist_1d["Volume"].iloc[-1])

        if current_price is None or current_price <= 0:
            raise ValueError(f"Não foi possível obter cotação válida para {clean_ticker}")

        # Nome da empresa amigável
        long_name = clean_ticker
        try:
            full_info = t.info
            long_name = full_info.get("shortName") or full_info.get("longName") or clean_ticker
        except Exception:
            pass

        return {
            "success": True,
            "ticker": clean_ticker,
            "name": long_name,
            "price": float(current_price),
            "prev_close": float(prev_close) if prev_close else float(current_price),
            "day_high": float(day_high) if day_high else float(current_price * 1.01),
            "day_low": float(day_low) if day_low else float(current_price * 0.99),
            "volume": int(volume) if volume else 1000000,
            "currency": currency,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "ticker": clean_ticker,
            "name": clean_ticker,
            "price": 0.0,
            "prev_close": 0.0,
            "day_high": 0.0,
            "day_low": 0.0,
            "volume": 0,
            "currency": "BRL" if ".SA" in clean_ticker else "USD",
            "error": str(e)
        }

@st.cache_data(ttl=300, show_spinner=False)
def fetch_history_data(ticker_symbol: str, period: str = "1y") -> pd.DataFrame:
    """Busca o histórico de preços para plotagem de gráficos."""
    try:
        t = yf.Ticker(ticker_symbol.strip().upper())
        df = t.history(period=period)
        if df.empty:
            return pd.DataFrame()
        df = df.reset_index()
        # Converte timezone se existir para evitar bugs de exibição
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
        return df
    except Exception:
        return pd.DataFrame()

# =============================================================================
# CLIENTE GEMINI AI INTEGRADO
# =============================================================================
def get_gemini_api_key() -> str:
    """Recupera a chave da API do Gemini de várias fontes possíveis."""
    # 1. Variável de ambiente
    key = os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key.strip()
    # 2. st.secrets (Streamlit Cloud ou secrets.toml)
    try:
        if "GEMINI_API_KEY" in st.secrets:
            return str(st.secrets["GEMINI_API_KEY"]).strip()
    except Exception:
        pass
    return ""

def generate_gemini_response(prompt: str, context_data: str) -> str:
    """
    Envia o contexto da carteira e a pergunta do usuário para a API do Gemini.
    Usa o modelo recomendado gemini-3.8-flash com prompt de consultor prudencial.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return (
            "⚠️ **Chave da API do Gemini não detectada!**\n\n"
            "Para ativar o consultor com IA em tempo real:\n"
            "1. Obtenha uma chave gratuita no [Google AI Studio](https://aistudio.google.com/).\n"
            "2. Adicione ao arquivo `.env`: `GEMINI_API_KEY=\"sua_chave\"` ou defina no terminal do VS Code.\n"
            "3. Você também pode informar a chave na barra lateral."
        )

    system_instruction = (
        "Você é um Consultor Sênior de Investimentos e Estrategista Financeiro especializado "
        "no mercado brasileiro (ações e FIIs da B3) e ativos globais (ações americanas, ETFs e ADRs).\n"
        "Seu objetivo é analisar os dados reais consolidados da carteira do investidor fornecidos no contexto, "
        "oferecendo feedbacks estratégicos de longo prazo, análises fundamentalistas, gestão de risco "
        "e correlação macroeconômica (Taxa Selic, juros do Federal Reserve, inflação IPCA/CPI, commodities e câmbio).\n\n"
        "REGRAS ESTRITAS DE COMPLIANCE:\n"
        "- Você atua ESTRITAMENTE como suporte analítico e educacional à tomada de decisão.\n"
        "- NUNCA emita ordens diretas imperativas de 'compre agora' ou 'venda tudo'.\n"
        "- Sempre apresente cenários de risco, prós e contras, reforçando princípios de diversificação e horizonte de tempo.\n"
        "- Responda em português claro, elegante, bem estruturado em tópicos, com números e raciocínio financeiro sólido."
    )

    full_prompt = f"{system_instruction}\n\n[DADOS DA CARTEIRA ATUAL DO USUÁRIO]:\n{context_data}\n\n[SOLICITAÇÃO DO INVESTIDOR]:\n{prompt}"

    # Tenta usar a biblioteca oficial Google GenAI
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generateContent(
            model="gemini-3.8-flash",
            contents=full_prompt
        )
        if hasattr(response, "text") and response.text:
            return response.text
    except Exception as e1:
        # Fallback para biblioteca google.generativeai (caso o ambiente local tenha a versão anterior)
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=api_key)
            model = legacy_genai.GenerativeModel("gemini-3.8-flash")
            response = model.generate_content(full_prompt)
            if response and response.text:
                return response.text
        except Exception as e2:
            return (
                f"❌ **Erro na comunicação com a API do Gemini:**\n\n"
                f"• Detalhes técnicos: `{str(e1)}` / `{str(e2)}`\n\n"
                f"Verifique se a sua chave de API está válida e se o pacote `google-genai` está instalado."
            )

    return "Não foi possível gerar uma resposta. Tente novamente em instantes."

# =============================================================================
# BARRA LATERAL (SIDEBAR): GESTÃO DINÂMICA DE ATIVOS
# =============================================================================
with st.sidebar:
    st.markdown("### 💼 Gestão de Ativos")
    st.caption("Cadastre e gerencie as posições da sua carteira:")

    with st.expander("➕ Adicionar / Editar Ativo", expanded=True):
        input_ticker = st.text_input(
            "Ticker do Ativo",
            placeholder="Ex: PETR4, VALE3, ITUB4, AAPL, NVDA",
            help="Para a B3, digite apenas o código (ex: PETR4 ou VALE3). O sistema busca a cotação em tempo real e preenche o Preço Médio automaticamente."
        ).strip().upper()

        current_market_price = 30.00
        if input_ticker:
            norm_ticker = normalize_b3_ticker(input_ticker)
            t_data = fetch_ticker_data(norm_ticker)
            if t_data["success"] and t_data["price"] > 0:
                current_market_price = float(t_data["price"])
                st.caption(f"⚡ **{t_data['name']}**: Cotação B3 **R$ {current_market_price:.2f}** *(preenchido automático, editável)*")

        col_qtd, col_pm = st.columns(2)
        with col_qtd:
            input_qtd = st.number_input("Quantidade", min_value=1, value=100, step=1, key="sb_qtd")
        with col_pm:
            input_pm = st.number_input(
                "Preço Médio (R$)",
                min_value=0.01,
                value=float(current_market_price),
                step=0.10,
                format="%.2f",
                key=f"sb_pm_{input_ticker}" if input_ticker else "sb_pm_default",
                help="Valor captado em tempo real da B3. Você pode alterar livremente para o preço real pago pelo ativo."
            )

        if st.button("💾 Salvar Ativo na Carteira", type="primary", use_container_width=True):
            if not input_ticker:
                st.error("Informe um Ticker válido!")
            else:
                final_ticker = normalize_b3_ticker(input_ticker)
                # Atualiza ou adiciona ativo
                existing_index = next((i for i, item in enumerate(st.session_state.portfolio) if item["ticker"] == final_ticker), None)
                if existing_index is not None:
                    st.session_state.portfolio[existing_index] = {
                        "ticker": final_ticker,
                        "quantidade": int(input_qtd),
                        "preco_medio": float(input_pm)
                    }
                    st.success(f"Ativo **{final_ticker}** atualizado com sucesso!")
                else:
                    st.session_state.portfolio.append({
                        "ticker": final_ticker,
                        "quantidade": int(input_qtd),
                        "preco_medio": float(input_pm)
                    })
                    st.success(f"Ativo **{final_ticker}** adicionado com sucesso!")
                st.rerun()

    # Opção para remover ativo
    if st.session_state.portfolio:
        with st.expander("🗑️ Remover Ativo"):
            tickers_list = [item["ticker"] for item in st.session_state.portfolio]
            ticker_para_remover = st.selectbox("Selecione o ativo para excluir", tickers_list)
            if st.button("Confirmar Exclusão", type="secondary", use_container_width=True):
                st.session_state.portfolio = [item for item in st.session_state.portfolio if item["ticker"] != ticker_para_remover]
                st.info(f"Ativo {ticker_para_remover} removido.")
                st.rerun()

    # Reset para carteira modelo
    if st.button("🔄 Restaurar Carteira Modelo", use_container_width=True):
        st.session_state.portfolio = list(DEFAULT_PORTFOLIO)
        st.rerun()

    st.markdown("---")
    
    # Campo opcional para chave de API manual na barra lateral
    current_key = get_gemini_api_key()
    if not current_key:
        st.markdown("#### 🔑 Configuração da API Gemini")
        manual_key = st.text_input("Cole sua Chave Gemini API:", type="password", help="Armazenada apenas nesta sessão.")
        if manual_key:
            os.environ["GEMINI_API_KEY"] = manual_key.strip()
            st.success("Chave registrada para a sessão!")
            st.rerun()

    st.caption("v2.5.0 • B3 & Global Invest • Python & Streamlit")

# =============================================================================
# PROCESSAMENTO DOS DADOS DA CARTEIRA
# =============================================================================
processed_rows = []
total_invested = 0.0
total_current_value = 0.0
currency_warning = False

with st.spinner("Atualizando cotações em tempo real via yfinance..."):
    for item in st.session_state.portfolio:
        t_code = item["ticker"]
        qtd = item["quantidade"]
        pm = item["preco_medio"]
        
        quote_data = fetch_ticker_data(t_code)
        
        if quote_data["success"] and quote_data["price"] > 0:
            cur_price = quote_data["price"]
            name = quote_data["name"]
            curr = quote_data["currency"]
            status_ok = True
        else:
            cur_price = pm  # Fallback para não quebrar cálculos
            name = f"{t_code} (Cotação indisponível)"
            curr = "BRL"
            status_ok = False

        val_invested = qtd * pm
        val_current = qtd * cur_price
        profit_loss_brl = val_current - val_invested
        profit_loss_pct = ((cur_price / pm) - 1.0) * 100.0 if pm > 0 else 0.0

        total_invested += val_invested
        total_current_value += val_current

        processed_rows.append({
            "ticker": t_code,
            "nome": name,
            "quantidade": qtd,
            "preco_medio": pm,
            "preco_atual": cur_price,
            "valor_investido": val_invested,
            "valor_atual": val_current,
            "lucro_prejuizo": profit_loss_brl,
            "rentabilidade_pct": profit_loss_pct,
            "moeda": curr,
            "status_ok": status_ok
        })

df_portfolio = pd.DataFrame(processed_rows)

if not df_portfolio.empty and total_current_value > 0:
    df_portfolio["peso_pct"] = (df_portfolio["valor_atual"] / total_current_value) * 100.0
else:
    df_portfolio["peso_pct"] = 0.0

total_profit_loss = total_current_value - total_invested
total_profit_loss_pct = ((total_current_value / total_invested) - 1.0) * 100.0 if total_invested > 0 else 0.0

# =============================================================================
# CABEÇALHO DO APLICATIVO
# =============================================================================
col_head1, col_head2 = st.columns([3, 1])
with col_head1:
    st.title("📈 Consultor de Investimentos Pessoal")
    st.caption("Gestão integrada de ativos B3 & Mercado Internacional com Inteligência Artificial Gemini")
with col_head2:
    st.markdown(
        f"<div style='text-align: right; padding-top: 10px; color: #9ca3af; font-size: 0.85rem;'>"
        f"📅 Atualizado em: <strong>{datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}</strong>"
        f"</div>",
        unsafe_allow_html=True
    )

# =============================================================================
# ESTRUTURA VISUAL PRINCIPAL EM ABAS (st.tabs)
# =============================================================================
tab_overview, tab_market, tab_reports, tab_ai_advisor, tab_instructions = st.tabs([
    "📊 Visão Geral da Carteira",
    "🔍 Consulta de Cotações da Bolsa",
    "📈 Relatórios Mensais e Anuais",
    "🤖 Assistente de IA Integrado (Gemini)",
    "💻 Instruções & Código VS Code"
])

# =============================================================================
# ABA 1: VISÃO GERAL DA CARTEIRA
# =============================================================================
with tab_overview:
    st.markdown("#### 💎 Resumo Consolidado do Patrimônio")
    
    # 4 Cartões de Métricas no Topo
    c1, c2, c3, c4 = st.columns(4)
    
    with c1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Patrimônio Atual Total</div>
            <div class="metric-value">R$ {total_current_value:,.2f}</div>
            <div class="metric-delta" style="color: #60a5fa;">💼 {len(df_portfolio)} posições ativas</div>
        </div>
        """, unsafe_allow_html=True)

    with c2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Capital Total Aportado</div>
            <div class="metric-value">R$ {total_invested:,.2f}</div>
            <div class="metric-delta" style="color: #9ca3af;">Preço médio ponderado</div>
        </div>
        """, unsafe_allow_html=True)

    with c3:
        is_pos = total_profit_loss >= 0
        delta_class = "delta-positive" if is_pos else "delta-negative"
        signal = "+" if is_pos else ""
        icon = "▲" if is_pos else "▼"
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Lucro / Prejuízo em Reais</div>
            <div class="metric-value {delta_class}">{signal}R$ {total_profit_loss:,.2f}</div>
            <div class="metric-delta {delta_class}">{icon} {signal}R$ {abs(total_profit_loss):,.2f} nominal</div>
        </div>
        """, unsafe_allow_html=True)

    with c4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Rentabilidade Geral (%)</div>
            <div class="metric-value {delta_class}">{signal}{total_profit_loss_pct:.2f}%</div>
            <div class="metric-delta {delta_class}">{icon} {signal}{abs(total_profit_loss_pct):.2f}% retorno histórico</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Tabela de Posições Detalhada
    st.markdown("#### 📋 Posições Individuais e Cálculos Automáticos")
    
    if not df_portfolio.empty:
        # Formata para exibição elegante
        df_display = df_portfolio.copy()
        df_display["Preço Médio"] = df_display["preco_medio"].apply(lambda x: f"R$ {x:,.2f}")
        df_display["Preço Atual"] = df_display["preco_atual"].apply(lambda x: f"R$ {x:,.2f}")
        df_display["Total Investido"] = df_display["valor_investido"].apply(lambda x: f"R$ {x:,.2f}")
        df_display["Valor de Mercado"] = df_display["valor_atual"].apply(lambda x: f"R$ {x:,.2f}")
        df_display["Lucro/Prejuízo (R$)"] = df_display["lucro_prejuizo"].apply(lambda x: f"{'+' if x>=0 else ''}R$ {x:,.2f}")
        df_display["Retorno (%)"] = df_display["rentabilidade_pct"].apply(lambda x: f"{'+' if x>=0 else ''}{x:.2f}%")
        df_display["Peso (%)"] = df_display["peso_pct"].apply(lambda x: f"{x:.1f}%")

        st.dataframe(
            df_display[[
                "ticker", "nome", "quantidade", "Preço Médio", 
                "Preço Atual", "Total Investido", "Valor de Mercado", 
                "Lucro/Prejuízo (R$)", "Retorno (%)", "Peso (%)"
            ]].rename(columns={"ticker": "Ticker", "nome": "Empresa / Ativo", "quantidade": "Qtd"}),
            use_container_width=True,
            hide_index=True
        )
    else:
        st.info("Nenhum ativo cadastrado. Utilize a barra lateral à esquerda para adicionar ações.")

    st.markdown("---")

    # Seção Gráfica: Histórico de Preços & Alocação
    col_g1, col_g2 = st.columns([3, 2])
    
    with col_g1:
        st.markdown("#### 📉 Gráfico de Linha Interativo de Preços Recentes")
        
        tickers_available = [item["ticker"] for item in st.session_state.portfolio]
        if tickers_available:
            c_sel1, c_sel2 = st.columns([2, 1])
            with c_sel1:
                selected_ticker = st.selectbox("Ativo para Análise Gráfica:", tickers_available, index=0)
            with c_sel2:
                selected_period = st.selectbox("Intervalo:", ["1mo", "3mo", "6mo", "1y", "2y", "5y"], index=3, 
                                               format_func=lambda x: {"1mo": "1 Mês", "3mo": "3 Meses", "6mo": "6 Meses", "1y": "1 Ano", "2y": "2 Anos", "5y": "5 Anos"}.get(x, x))
            
            df_hist = fetch_history_data(selected_ticker, selected_period)
            
            if not df_hist.empty and "Close" in df_hist.columns:
                fig_line = go.Figure()
                
                # Linha de Preço de Fechamento
                fig_line.add_trace(go.Scatter(
                    x=df_hist["Date"],
                    y=df_hist["Close"],
                    mode="lines",
                    name=f"Preço {selected_ticker}",
                    line=dict(color="#3b82f6", width=2.5),
                    fill="tozeroy",
                    fillcolor="rgba(59, 130, 246, 0.08)"
                ))

                # Linha do Preço Médio do Usuário para Comparação
                user_item = next((i for i in st.session_state.portfolio if i["ticker"] == selected_ticker), None)
                if user_item:
                    pm_user = user_item["preco_medio"]
                    fig_line.add_hline(
                        y=pm_user,
                        line_dash="dash",
                        line_color="#f59e0b",
                        annotation_text=f"Seu Preço Médio: R$ {pm_user:,.2f}",
                        annotation_position="bottom right"
                    )

                fig_line.update_layout(
                    template="plotly_dark",
                    paper_bgcolor="#111827",
                    plot_bgcolor="#111827",
                    margin=dict(l=20, r=20, t=30, b=20),
                    height=380,
                    xaxis=dict(showgrid=True, gridcolor="#1f2937"),
                    yaxis=dict(showgrid=True, gridcolor="#1f2937", tickprefix="R$ "),
                    hovermode="x unified"
                )
                st.plotly_chart(fig_line, use_container_width=True)
            else:
                st.warning(f"Não foi possível carregar os dados históricos para o ticker {selected_ticker}.")
        else:
            st.info("Cadastre um ativo para visualizar o gráfico histórico.")

    with col_g2:
        st.markdown("#### 🥧 Distribuição da Carteira")
        if not df_portfolio.empty and total_current_value > 0:
            fig_pie = px.pie(
                df_portfolio,
                names="ticker",
                values="valor_atual",
                hole=0.55,
                color_discrete_sequence=px.colors.sequential.Blues_r
            )
            fig_pie.update_traces(
                textposition="inside",
                textinfo="percent+label",
                marker=dict(line=dict(color="#111827", width=2))
            )
            fig_pie.update_layout(
                template="plotly_dark",
                paper_bgcolor="#111827",
                plot_bgcolor="#111827",
                margin=dict(l=10, r=10, t=20, b=20),
                height=380,
                showlegend=False
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("Sem dados suficientes para o gráfico de pizza.")

# =============================================================================
# ABA DE CONSULTA DE COTAÇÕES DA BOLSA (B3 & GLOBAL)
# =============================================================================
with tab_market:
    st.markdown("#### 🔍 Consulta e Radar de Cotações em Tempo Real (B3 & Global)")
    st.caption("Consulte o preço ao vivo, variação diária, máximas, mínimas e volume de qualquer ação negociada na B3 ou bolsas internacionais.")

    col_q1, col_q2 = st.columns([3, 1])
    with col_q1:
        query_ticker = st.text_input(
            "Digite o Código da Ação (Ticker):",
            value="PETR4",
            placeholder="Ex: PETR4, VALE3, ITUB4, BBAS3, WEGE3, AAPL, NVDA",
            help="Para a B3, você pode digitar apenas o código (ex: PETR4 ou VALE3) que o sistema normaliza automaticamente."
        )
    with col_q2:
        st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
        btn_consultar = st.button("🔎 Consultar Cotação", use_container_width=True)

    target_ticker = normalize_b3_ticker(query_ticker)
    if target_ticker:
        with st.spinner(f"Consultando cotação em tempo real de {target_ticker}..."):
            q_info = fetch_ticker_data(target_ticker)
            if q_info["success"] and q_info["price"] > 0:
                p_atual = q_info["price"]
                p_fech = q_info["prev_close"]
                var_rs = p_atual - p_fech
                var_pct = (var_rs / p_fech) * 100.0 if p_fech > 0 else 0.0
                is_p = var_rs >= 0
                sig = "+" if is_p else ""
                col_c = "#10b981" if is_p else "#ef4444"

                # Card com detalhes
                st.markdown(f"""
                <div class="metric-card" style="border: 1px solid #3b82f6;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <span style="background: #1e3a8a; color: #93c5fa; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: bold;">{q_info['currency']}</span>
                            <span style="font-size: 1.6rem; font-weight: 800; color: white; margin-left: 8px;">{q_info['ticker']}</span>
                            <span style="color: #9ca3af; font-size: 0.95rem; margin-left: 8px;">{q_info['name']}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 2.1rem; font-weight: 800; color: white;">
                                {'R$ ' if q_info['currency'] == 'BRL' else '$ '}{p_atual:,.2f}
                            </div>
                            <div style="color: {col_c}; font-weight: bold; font-size: 0.95rem;">
                                {sig}{'R$ ' if q_info['currency'] == 'BRL' else '$ '}{var_rs:,.2f} ({sig}{var_pct:.2f}%)
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                c_m1, c_m2, c_m3, c_m4 = st.columns(4)
                with c_m1:
                    st.metric("Fechamento Anterior", f"R$ {p_fech:,.2f}" if q_info['currency'] == 'BRL' else f"$ {p_fech:,.2f}")
                with c_m2:
                    st.metric("Máxima do Dia", f"R$ {q_info['day_high']:,.2f}" if q_info['currency'] == 'BRL' else f"$ {q_info['day_high']:,.2f}")
                with c_m3:
                    st.metric("Mínima do Dia", f"R$ {q_info['day_low']:,.2f}" if q_info['currency'] == 'BRL' else f"$ {q_info['day_low']:,.2f}")
                with c_m4:
                    st.metric("Volume Negociado", f"{q_info['volume']:,}".replace(",", "."))

                # Gráfico rápido do ativo consultado
                df_q_hist = fetch_history_data(target_ticker, "1mo")
                if not df_q_hist.empty and "Close" in df_q_hist.columns:
                    f_q = go.Figure()
                    f_q.add_trace(go.Scatter(
                        x=df_q_hist["Date"], 
                        y=df_q_hist["Close"], 
                        mode="lines", 
                        name="Cotação",
                        line=dict(color="#3b82f6", width=2.5)
                    ))
                    f_q.update_layout(
                        template="plotly_dark", 
                        height=280, 
                        margin=dict(l=10, r=10, t=10, b=10), 
                        paper_bgcolor="#111827", 
                        plot_bgcolor="#111827",
                        xaxis=dict(showgrid=True, gridcolor="#1f2937"),
                        yaxis=dict(showgrid=True, gridcolor="#1f2937", tickprefix="R$ " if q_info['currency'] == 'BRL' else "$ ")
                    )
                    st.plotly_chart(f_q, use_container_width=True)

                # Botão para adicionar direto na carteira
                col_add1, col_add2 = st.columns([3, 1])
                with col_add1:
                    add_qtd = st.number_input(f"Quantidade de ações {target_ticker} a adicionar:", min_value=1, value=100, step=1, key="add_from_mkt_qtd")
                with col_add2:
                    st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
                    if st.button(f"➕ Adicionar {target_ticker} à Carteira", use_container_width=True, key="btn_add_from_market"):
                        existing_idx = next((i for i, item in enumerate(st.session_state.portfolio) if item["ticker"] == target_ticker), None)
                        if existing_idx is not None:
                            st.session_state.portfolio[existing_idx] = {"ticker": target_ticker, "quantidade": int(add_qtd), "preco_medio": float(p_atual)}
                        else:
                            st.session_state.portfolio.append({"ticker": target_ticker, "quantidade": int(add_qtd), "preco_medio": float(p_atual)})
                        st.success(f"Ativo **{target_ticker}** cadastrado na sua carteira a R$ {p_atual:.2f}!")
                        st.rerun()
            else:
                st.error(f"Não foi possível obter cotação para '{target_ticker}'. Verifique se o ticker existe na B3 ou bolsas globais.")

    st.markdown("---")
    st.markdown("##### 📡 Radar de Cotações Principais da B3 e Mercado Global")
    radar_tickers = ["PETR4.SA", "VALE3.SA", "ITUB4.SA", "BBAS3.SA", "WEGE3.SA", "BBDC4.SA", "RENT3.SA", "TAEE11.SA", "MGLU3.SA", "AAPL", "NVDA"]
    radar_rows = []
    for r_t in radar_tickers:
        r_d = fetch_ticker_data(r_t)
        if r_d["success"] and r_d["price"] > 0:
            pr = r_d["price"]
            pc = r_d["prev_close"]
            diff = pr - pc
            diff_p = (diff / pc) * 100.0 if pc > 0 else 0.0
            radar_rows.append({
                "Ticker": r_d["ticker"],
                "Empresa": r_d["name"],
                "Preço Atual": f"R$ {pr:,.2f}" if r_d["currency"] == "BRL" else f"$ {pr:,.2f}",
                "Variação Dia": f"{'+' if diff>=0 else ''}{diff_p:.2f}%",
                "Máxima Dia": f"R$ {r_d['day_high']:,.2f}" if r_d["currency"] == "BRL" else f"$ {r_d['day_high']:,.2f}",
                "Mínima Dia": f"R$ {r_d['day_low']:,.2f}" if r_d["currency"] == "BRL" else f"$ {r_d['day_low']:,.2f}",
                "Moeda": r_d["currency"]
            })
    if radar_rows:
        st.dataframe(pd.DataFrame(radar_rows), use_container_width=True, hide_index=True)

# =============================================================================
# ABA 2: RELATÓRIOS MENSAIS E ANUAIS
# =============================================================================
with tab_reports:
    # Cabeçalho executivo para impressão
    st.markdown("""
    <div class="print-header" style="padding-bottom: 12px; margin-bottom: 20px; border-bottom: 2px solid #000;">
        <h2 style="margin: 0; color: #000;">Relatório de Desempenho & Projeção Financeira</h2>
        <p style="margin: 4px 0 0 0; color: #555; font-size: 12px;">B3 & Global Invest Advisor • Documento Executivo de Carteira</p>
    </div>
    """, unsafe_allow_html=True)

    # Botão de impressão na tela
    col_rep_head, col_rep_btn = st.columns([3, 1])
    with col_rep_head:
        st.markdown("#### 📆 Desempenho Consolidado & Simulador de Aportes")
        st.caption("Projete a evolução do seu patrimônio combinando aportes periódicos, valorização patrimonial e reinvestimento de dividendos estimados.")
    with col_rep_btn:
        st.markdown("""
        <div style="text-align: right;" class="no-print">
            <button onclick="window.print()" style="
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                border: none;
                padding: 10px 18px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 13px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
                display: inline-flex;
                align-items: center;
                gap: 6px;
            ">
                🖨️ Imprimir Relatório / Salvar em PDF
            </button>
        </div>
        """, unsafe_allow_html=True)

    col_sim_cfg, col_sim_res = st.columns([1, 2])
    
    with col_sim_cfg:
        st.markdown("##### ⚙️ Parâmetros da Simulação")
        
        sim_patrimonio_inicial = st.number_input(
            "Patrimônio Inicial (R$):",
            min_value=0.0,
            value=float(total_current_value if total_current_value > 0 else 10000.0),
            step=1000.0,
            format="%.2f"
        )
        
        sim_aporte_mensal = st.number_input(
            "Aporte Mensal Previsto (R$):",
            min_value=0.0,
            value=1500.0,
            step=250.0,
            format="%.2f"
        )
        
        sim_anos = st.slider(
            "Horizonte de Tempo (Anos):",
            min_value=1,
            max_value=30,
            value=10,
            step=1
        )
        
        sim_dy_anual = st.slider(
            "Dividend Yield Médio Anual (% a.a.):",
            min_value=0.0,
            max_value=20.0,
            value=6.5,
            step=0.5,
            help="Estimativa da taxa de proventos pagos pelas empresas (ex: 6.5% típico de boas pagadoras da B3)."
        )
        
        sim_valorizacao_anual = st.slider(
            "Valorização de Capital Estimada (% a.a.):",
            min_value=-5.0,
            max_value=25.0,
            value=8.0,
            step=0.5,
            help="Crescimento médio anual do valor dos ativos além dos proventos."
        )

        taxa_total_anual = (sim_dy_anual + sim_valorizacao_anual) / 100.0
        taxa_mensal = ((1.0 + taxa_total_anual) ** (1.0 / 12.0)) - 1.0

    with col_sim_res:
        st.markdown("##### 🚀 Projeção Acumulada de Longo Prazo")

        # Cálculo mês a mês
        meses_totais = sim_anos * 12
        sim_data = []
        
        saldo_atual = sim_patrimonio_inicial
        total_aportado = sim_patrimonio_inicial
        dividendos_acumulados = 0.0
        
        for m in range(1, meses_totais + 1):
            # Proventos do mês baseados no DY
            dy_mensal = ((1.0 + (sim_dy_anual / 100.0)) ** (1.0 / 12.0)) - 1.0
            div_mes = saldo_atual * dy_mensal
            dividendos_acumulados += div_mes
            
            # Valorização do capital + dividendos reinvestidos
            saldo_atual = (saldo_atual * (1.0 + taxa_mensal)) + sim_aporte_mensal
            total_aportado += sim_aporte_mensal
            
            if m % 12 == 0 or m == meses_totais:
                ano = m // 12
                sim_data.append({
                    "Ano": f"Ano {ano}",
                    "Total Aportado (R$)": total_aportado,
                    "Patrimônio Projetado (R$)": saldo_atual,
                    "Dividendos Acumulados (R$)": dividendos_acumulados,
                    "Renda Mensal Estimada (R$)": (saldo_atual * (sim_dy_anual / 100.0)) / 12.0
                })

        df_sim = pd.DataFrame(sim_data)

        # Gráfico de evolução do patrimônio
        fig_sim = go.Figure()
        fig_sim.add_trace(go.Bar(
            x=df_sim["Ano"],
            y=df_sim["Total Aportado (R$)"],
            name="Total Aportado",
            marker_color="#4b5563"
        ))
        fig_sim.add_trace(go.Scatter(
            x=df_sim["Ano"],
            y=df_sim["Patrimônio Projetado (R$)"],
            mode="lines+markers",
            name="Patrimônio Total (Aportes + Juros)",
            line=dict(color="#10b981", width=3)
        ))

        fig_sim.update_layout(
            template="plotly_dark",
            paper_bgcolor="#111827",
            plot_bgcolor="#111827",
            margin=dict(l=20, r=20, t=30, b=20),
            height=340,
            yaxis=dict(tickprefix="R$ ", gridcolor="#1f2937"),
            hovermode="x unified"
        )
        st.plotly_chart(fig_sim, use_container_width=True)

        # Métricas Finais da Simulação
        ultimo_registro = df_sim.iloc[-1]
        m1, m2, m3 = st.columns(3)
        m1.metric("Patrimônio Final", f"R$ {ultimo_registro['Patrimônio Projetado (R$)']:,.2f}")
        m2.metric("Total em Aportes", f"R$ {ultimo_registro['Total Aportado (R$)']:,.2f}")
        m3.metric("Renda Mensal Estimada", f"R$ {ultimo_registro['Renda Mensal Estimada (R$)']:,.2f}", delta=f"DY {sim_dy_anual}% a.a.")

    st.markdown("---")
    st.markdown("##### 📑 Tabela de Fechamentos Anuais da Simulação")
    
    df_sim_formatted = df_sim.copy()
    for col in ["Total Aportado (R$)", "Patrimônio Projetado (R$)", "Dividendos Acumulados (R$)", "Renda Mensal Estimada (R$)"]:
        df_sim_formatted[col] = df_sim_formatted[col].apply(lambda x: f"R$ {x:,.2f}")
    
    st.dataframe(df_sim_formatted, use_container_width=True, hide_index=True)

# =============================================================================
# ABA 3: ASSISTENTE DE IA INTEGRADO (API DO GEMINI)
# =============================================================================
with tab_ai_advisor:
    st.markdown("#### 🤖 Consultor Estratégico com Inteligência Artificial Gemini")
    
    st.markdown("""
    <div class="disclaimer-box">
        <strong>⚠️ Aviso Regulatório de Suporte à Decisão:</strong><br>
        O assistente IA atua exclusivamente como ferramenta educacional e analítica de apoio à tomada de decisão. 
        Não são emitidas ordens de compra ou venda e as análises não configuram recomendação formal de investimento nos termos da CVM.
    </div>
    """, unsafe_allow_html=True)

    # Prepara o resumo consolidado da carteira para envio ao Gemini
    summary_lines = []
    summary_lines.append(f"Patrimônio Total: R$ {total_current_value:,.2f}")
    summary_lines.append(f"Total Investido: R$ {total_invested:,.2f}")
    summary_lines.append(f"Lucro/Prejuízo Total: R$ {total_profit_loss:,.2f} ({total_profit_loss_pct:.2f}%)")
    summary_lines.append("\nComposição dos Ativos:")
    for _, row in df_portfolio.iterrows():
        summary_lines.append(
            f"- {row['ticker']} ({row['nome']}): {row['quantidade']} ações, Preço Médio: R$ {row['preco_medio']:.2f}, "
            f"Preço Atual: R$ {row['preco_atual']:.2f}, Valor Atual: R$ {row['valor_atual']:.2f}, "
            f"Peso na Carteira: {row['peso_pct']:.1f}%, Retorno: {row['rentabilidade_pct']:.2f}%"
        )
    portfolio_context_str = "\n".join(summary_lines)

    # Botões rápidos de temas estratégicos
    st.markdown("##### 💡 Consultas Rápidas Sugeridas:")
    col_b1, col_b2, col_b3, col_b4 = st.columns(4)
    
    preset_prompt = None
    if col_b1.button("🛡️ Análise de Risco e Concentração", use_container_width=True):
        preset_prompt = "Faça um diagnóstico completo de risco e concentração da minha carteira. Quais ativos pesam mais e onde há risco setorial?"
    if col_b2.button("🏦 Impacto Macroeconômico (Selic & Juros)", use_container_width=True):
        preset_prompt = "Como o atual cenário de juros (Selic no Brasil e taxas do Fed nos EUA) impacta cada classe de ativo presente na minha carteira?"
    if col_b3.button("⚖️ Sugestão de Rebalanceamento", use_container_width=True):
        preset_prompt = "Considerando uma estratégia de longo prazo focada em valor e crescimento sustentável, quais critérios de rebalanceamento você sugere para minha alocação?"
    if col_b4.button("💰 Proventos e Renda Passiva", use_container_width=True):
        preset_prompt = "Avalie o perfil pagador de dividendos da minha carteira e sugira como otimizar a geração de renda passiva mantendo a segurança."

    # Histórico de Chat
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state.chat_messages:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

    # Entrada do usuário
    user_input = st.chat_input("Digite sua dúvida estratégica sobre sua carteira ou mercado financeiro...")

    final_prompt = preset_prompt or user_input
    
    if final_prompt:
        # Adiciona a mensagem do usuário ao histórico
        st.session_state.chat_messages.append({"role": "user", "content": final_prompt})
        with st.chat_message("user"):
            st.markdown(final_prompt)

        # Gera a resposta com o Gemini
        with st.chat_message("assistant"):
            with st.spinner("O Gemini está analisando sua carteira e o contexto macroeconômico..."):
                ai_reply = generate_gemini_response(final_prompt, portfolio_context_str)
                st.markdown(ai_reply)
                st.session_state.chat_messages.append({"role": "assistant", "content": ai_reply})

# =============================================================================
# ABA 4: INSTRUÇÕES DE EXECUÇÃO NO VS CODE & CÓDIGO
# =============================================================================
with tab_instructions:
    st.markdown("#### 💻 Como Rodar Este Projeto Localmente no VS Code")
    
    st.markdown("""
    Siga o passo a passo abaixo para rodar este aplicativo no seu computador ou servidor:

    ##### 1. Pré-requisitos
    - Python 3.10 ou superior instalado.
    - VS Code instalado com a extensão oficial do Python.

    ##### 2. Criação do Ambiente Virtual (Recomendado)
    No terminal integrado do VS Code (`Ctrl + ~`):
    ```bash
    # Criar ambiente virtual
    python -m venv venv

    # Ativar no Windows (PowerShell):
    .\\venv\\Scripts\\activate

    # Ativar no Linux / Mac:
    source venv/bin/activate
    ```

    ##### 3. Instalação dos Pacotes
    ```bash
    pip install streamlit pandas yfinance plotly google-genai python-dotenv
    ```

    ##### 4. Configuração da Chave da API do Gemini
    Crie um arquivo chamado `.env` na raiz do projeto contendo:
    ```env
    GEMINI_API_KEY=AIzaSy...sua_chave_aqui
    ```
    *(Você pode gerar sua chave gratuitamente no Google AI Studio)*

    ##### 5. Executando o Aplicativo
    ```bash
    streamlit run app.py
    ```
    
    O Streamlit abrirá automaticamente no navegador em:
    - **Local:** `http://localhost:8501`
    - **Rede Local:** `http://<seu-ip-local>:8501` (ideal para testar no celular conectado no mesmo Wi-Fi)
    """)

# =============================================================================
# FIM DO ARQUIVO APP.PY
# =============================================================================
