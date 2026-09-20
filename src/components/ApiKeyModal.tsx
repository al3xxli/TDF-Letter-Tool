import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Check, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  promptMessage?: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  promptMessage,
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    setInputVal(apiKey);
    setTestStatus('idle');
    setStatusMessage('');
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = inputVal.trim();
    if (!keyToTest) {
      setTestStatus('invalid');
      setStatusMessage('Please enter an API key to test.');
      return;
    }

    setTestStatus('testing');
    setStatusMessage('Validating key with Gemini API...');

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setTestStatus('valid');
        setStatusMessage('API key is verified and operational.');
      } else {
        setTestStatus('invalid');
        setStatusMessage(data.error || 'Failed to validate API key. Please check the value.');
      }
    } catch (err: any) {
      setTestStatus('invalid');
      setStatusMessage('Network error while validating key. Please check your connection.');
    }
  };

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setTestStatus('invalid');
      setStatusMessage('Please enter a valid API key.');
      return;
    }
    onSaveKey(trimmed);
    setTestStatus('valid');
    setStatusMessage('API key saved to browser storage.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey('');
    setTestStatus('idle');
    setStatusMessage('API key removed from browser storage.');
  };

  return (
    <div
      id="api-key-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div
        id="api-key-modal-card"
        className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden text-black"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-black" />
            <h2 className="text-sm font-semibold tracking-tight text-black">
              Gemini API Key Configuration
            </h2>
          </div>
          <button
            id="btn-close-api-key-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {promptMessage && (
            <div className="p-3 border border-amber-300 bg-amber-50 text-amber-900 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{promptMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-zinc-600 leading-relaxed">
              This application operates on a <strong>Bring Your Own Key</strong> model. Your Gemini API key is stored strictly in your browser&apos;s <code>localStorage</code> and transmitted securely with your requests. It is never persisted on any external database.
            </p>
          </div>

          {/* Key Input Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="gemini-api-key-input"
              className="block font-semibold text-zinc-900 text-xs uppercase tracking-wider"
            >
              Google Gemini API Key
            </label>
            <div className="relative flex items-center">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setTestStatus('idle');
                  setStatusMessage('');
                }}
                placeholder="AIzaSy..."
                className="w-full pl-3 pr-10 py-2 border border-zinc-300 rounded-lg font-mono text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 p-1 text-zinc-400 hover:text-black cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-zinc-600 hover:text-black underline font-medium"
              >
                <span>Get a free API key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Key</span>
                </button>
              )}
            </div>
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                testStatus === 'valid'
                  ? 'bg-zinc-50 border-zinc-400 text-zinc-900'
                  : testStatus === 'invalid'
                  ? 'bg-zinc-100 border-zinc-500 text-black font-medium'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}
            >
              {testStatus === 'valid' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              {testStatus === 'invalid' && <AlertCircle className="w-4 h-4 text-zinc-800 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
            <button
              id="btn-test-api-key"
              type="button"
              disabled={testStatus === 'testing' || !inputVal.trim()}
              onClick={handleTestKey}
              className="px-3 py-1.5 border border-zinc-300 rounded-lg text-black font-medium hover:bg-zinc-50 disabled:opacity-40 transition cursor-pointer"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-zinc-600 hover:text-black font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-save-api-key"
                type="button"
                onClick={handleSave}
                disabled={!inputVal.trim()}
                className="px-4 py-1.5 bg-black text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
              >
                Save to Local Storage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
