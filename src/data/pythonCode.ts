export const PYTHON_APP_CODE = `"""
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

load_dotenv()

st.set_page_config(
    page_title="B3 & Global Invest Advisor",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilização CSS Dark Mode Injetada via st.markdown
DARK_THEME_CSS = """
<style>
    .stApp {
        background-color: #0b0f19;
        color: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    section[data-testid="stSidebar"] {
        background-color: #111827;
        border-right: 1px solid #1f2937;
    }
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
    }
    .stTabs [aria-selected="true"] {
        background-color: #1e3a8a !important;
        color: #60a5fa !important;
    }
    .metric-card {
        background: linear-gradient(145deg, #161f30 0%, #111827 100%);
        border: 1px solid #1f2937;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        margin-bottom: 12px;
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
    }
    .delta-positive { color: #10b981; font-weight: 600; }
    .delta-negative { color: #ef4444; font-weight: 600; }
    .disclaimer-box {
        background-color: #1f2937;
        border-left: 4px solid #3b82f6;
        padding: 14px 18px;
        border-radius: 6px;
        font-size: 0.85rem;
        color: #d1d5db;
        margin: 15px 0;
    }
</style>
"""
st.markdown(DARK_THEME_CSS, unsafe_allow_html=True)

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
    st.session_state.chat_messages = [{
        "role": "assistant",
        "content": "👋 Olá! Sou o seu Consultor de Investimentos IA. Como posso ajudar com sua carteira B3 & Global hoje?"
    }]

@st.cache_data(ttl=300, show_spinner=False)
def fetch_ticker_data(ticker_symbol: str) -> Dict[str, Any]:
    clean_ticker = ticker_symbol.strip().upper()
    try:
        t = yf.Ticker(clean_ticker)
        info = t.fast_info
        current_price = getattr(info, "last_price", None)
        prev_close = getattr(info, "previous_close", None)
        currency = getattr(info, "currency", "BRL" if ".SA" in clean_ticker else "USD")

        if current_price is None or pd.isna(current_price) or current_price <= 0:
            hist = t.history(period="5d")
            if not hist.empty:
                current_price = float(hist["Close"].iloc[-1])
                prev_close = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else current_price

        if current_price is None or current_price <= 0:
            raise ValueError(f"Preço não encontrado para {clean_ticker}")

        return {
            "success": True,
            "ticker": clean_ticker,
            "name": clean_ticker,
            "price": float(current_price),
            "prev_close": float(prev_close) if prev_close else float(current_price),
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
            "currency": "BRL" if ".SA" in clean_ticker else "USD",
            "error": str(e)
        }

@st.cache_data(ttl=300, show_spinner=False)
def fetch_history_data(ticker_symbol: str, period: str = "1y") -> pd.DataFrame:
    try:
        t = yf.Ticker(ticker_symbol.strip().upper())
        df = t.history(period=period)
        if df.empty:
            return pd.DataFrame()
        df = df.reset_index()
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
        return df
    except Exception:
        return pd.DataFrame()

def get_gemini_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "")
    if key: return key.strip()
    try:
        if "GEMINI_API_KEY" in st.secrets:
            return str(st.secrets["GEMINI_API_KEY"]).strip()
    except Exception: pass
    return ""

def generate_gemini_response(prompt: str, context_data: str) -> str:
    api_key = get_gemini_api_key()
    if not api_key:
        return "⚠️ Chave GEMINI_API_KEY não encontrada no .env ou secrets."
    
    system_instruction = (
        "Você é um Consultor Sênior de Investimentos especializado em B3 e ativos globais. "
        "Atue estritamente como suporte à decisão sem emitir ordens de compra/venda diretas. "
        "Forneça feedbacks de longo prazo, análises fundamentalistas e contexto macroeconômico."
    )
    full_prompt = f"{system_instruction}\\n\\n[CARTEIRA]:\\n{context_data}\\n\\n[PERGUNTA]:\\n{prompt}"
    
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        res = client.models.generateContent(model="gemini-3.8-flash", contents=full_prompt)
        return res.text
    except Exception:
        import google.generativeai as legacy_genai
        legacy_genai.configure(api_key=api_key)
        model = legacy_genai.GenerativeModel("gemini-3.8-flash")
        res = model.generate_content(full_prompt)
        return res.text

# Sidebar - Cadastro com Preenchimento Automático de Cotação da B3
with st.sidebar:
    st.markdown("### 💼 Gestão de Ativos")
    t_in = st.text_input("Ticker da Ação (ex: PETR4, VALE3, AAPL)").strip().upper()
    
    # Busca cotação ao vivo para sugerir no Preço Médio
    cur_p = 30.0
    if t_in:
        clean_t = t_in if ".SA" in t_in or not t_in[:4].isalpha() else f"{t_in}.SA"
        q_auto = fetch_ticker_data(clean_t)
        if q_auto["success"] and q_auto["price"] > 0:
            cur_p = float(q_auto["price"])
            st.caption(f"⚡ Cotação B3: **R$ {cur_p:.2f}** *(preenchido automático, editável)*")

    col1, col2 = st.columns(2)
    q_in = col1.number_input("Quantidade", min_value=1, value=100)
    # Preço Médio sugerido automaticamente com a cotação, mas aberto para edição manual
    pm_in = col2.number_input("Preço Médio", min_value=0.01, value=float(cur_p), format="%.2f", key=f"pm_{t_in}" if t_in else "pm_def")
    
    if st.button("💾 Salvar Ativo na Carteira", type="primary"):
        if t_in:
            clean_t = t_in if ".SA" in t_in or not t_in[:4].isalpha() else f"{t_in}.SA"
            st.session_state.portfolio = [i for i in st.session_state.portfolio if i["ticker"] != clean_t] + [
                {"ticker": clean_t, "quantidade": int(q_in), "preco_medio": float(pm_in)}
            ]
            st.success(f"Ativo {clean_t} salvo com sucesso!")
            st.rerun()

    if st.session_state.portfolio:
        rem_t = st.selectbox("Remover ativo:", [i["ticker"] for i in st.session_state.portfolio])
        if st.button("Excluir"):
            st.session_state.portfolio = [i for i in st.session_state.portfolio if i["ticker"] != rem_t]
            st.rerun()

# Consolidação da Carteira
rows, tot_invested, tot_current = [], 0.0, 0.0
for it in st.session_state.portfolio:
    q = fetch_ticker_data(it["ticker"])
    p_cur = q["price"] if q["success"] and q["price"] > 0 else it["preco_medio"]
    v_inv = it["quantidade"] * it["preco_medio"]
    v_cur = it["quantidade"] * p_cur
    tot_invested += v_inv
    tot_current += v_cur
    rows.append({
        "ticker": it["ticker"],
        "quantidade": it["quantidade"],
        "preco_medio": it["preco_medio"],
        "preco_atual": p_cur,
        "valor_investido": v_inv,
        "valor_atual": v_cur,
        "lucro_prejuizo": v_cur - v_inv,
        "rentabilidade_pct": ((p_cur / it["preco_medio"]) - 1.0) * 100.0
    })

df_p = pd.DataFrame(rows)
if not df_p.empty and tot_current > 0:
    df_p["peso_pct"] = (df_p["valor_atual"] / tot_current) * 100.0

tot_pl = tot_current - tot_invested
tot_pl_pct = ((tot_current / tot_invested) - 1.0) * 100.0 if tot_invested > 0 else 0.0

# Abas
tab1, tab2, tab3 = st.tabs(["📊 Visão Geral da Carteira", "📈 Relatórios Mensais e Anuais", "🤖 Assistente IA Gemini"])

with tab1:
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Patrimônio Total", f"R$ {tot_current:,.2f}")
    c2.metric("Total Investido", f"R$ {tot_invested:,.2f}")
    c3.metric("Lucro/Prejuízo (R$)", f"R$ {tot_pl:,.2f}", delta=f"R$ {tot_pl:,.2f}")
    c4.metric("Rentabilidade (%)", f"{tot_pl_pct:.2f}%", delta=f"{tot_pl_pct:.2f}%")
    
    st.dataframe(df_p, use_container_width=True, hide_index=True)

    if not df_p.empty:
        t_sel = st.selectbox("Ativo para Histórico:", df_p["ticker"].tolist())
        df_hist = fetch_history_data(t_sel, "1y")
        if not df_hist.empty:
            fig = px.line(df_hist, x="Date", y="Close", title=f"Histórico Recente - {t_sel}")
            fig.update_layout(template="plotly_dark")
            st.plotly_chart(fig, use_container_width=True)

with tab2:
    st.subheader("Simulador de Desempenho e Aportes")
    # Projeção de aportes e dividendos...
    # (Código completo em app.py)

with tab3:
    st.subheader("Consultor de IA Gemini")
    for m in st.session_state.chat_messages:
        with st.chat_message(m["role"]): st.markdown(m["content"])
    user_q = st.chat_input("Pergunte ao Gemini sobre sua carteira...")
    if user_q:
        st.session_state.chat_messages.append({"role": "user", "content": user_q})
        with st.chat_message("user"): st.markdown(user_q)
        with st.chat_message("assistant"):
            ans = generate_gemini_response(user_q, df_p.to_string())
            st.markdown(ans)
            st.session_state.chat_messages.append({"role": "assistant", "content": ans})
`;
