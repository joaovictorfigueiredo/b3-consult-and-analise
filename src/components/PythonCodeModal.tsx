import React, { useState } from "react";
import { Copy, Check, Download, Terminal, X, Code, FileCode } from "lucide-react";
import { PYTHON_APP_CODE } from "../data/pythonCode";

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_APP_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadAppPy = () => {
    const blob = new Blob([PYTHON_APP_CODE], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReqs = () => {
    const content = `streamlit>=1.35.0
pandas>=2.0.0
yfinance>=0.2.40
plotly>=5.20.0
google-genai>=2.4.0
python-dotenv>=1.0.0
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "requirements.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Código Python para VS Code (app.py)
              </h3>
              <p className="text-[11px] text-gray-400">
                Streamlit + Pandas + yfinance + Plotly + Gemini AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar Código"}
            </button>
            <button
              onClick={handleDownloadAppPy}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar app.py
            </button>
            <button
              onClick={handleDownloadReqs}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              requirements.txt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions strip */}
        <div className="bg-gray-950 border-b border-gray-800 p-3 px-4 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Passo a passo no terminal do VS Code:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800 text-blue-300">
              pip install -r requirements.txt
            </span>
            <span className="text-gray-500">➔</span>
            <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800 text-amber-300">
              export GEMINI_API_KEY="sua_chave"
            </span>
            <span className="text-gray-500">➔</span>
            <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800 text-emerald-300">
              streamlit run app.py
            </span>
          </div>
        </div>

        {/* Code view */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-950 font-mono text-xs text-gray-300 leading-relaxed select-all">
          <pre className="whitespace-pre">{PYTHON_APP_CODE}</pre>
        </div>
      </div>
    </div>
  );
};
