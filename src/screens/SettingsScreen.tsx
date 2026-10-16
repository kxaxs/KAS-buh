// @ts-nocheck
import React from 'react';
import { useAppStore } from '../store';
import { AppUIContext } from '../context/AppUIContext';
import { 
  CloudDownload, CloudUpload, Trash2, ArrowRight
} from 'lucide-react';
import { APP_VERSION } from '../lib/app-core';

export function SettingsScreen() {
  const ui = React.useContext(AppUIContext);
  const { fileInputRef, handleExport, handleImport, setConfirmData } = ui;

  const sales = useAppStore(s => s.sales);
  const procedures = useAppStore(s => s.procedures);
  const clients = useAppStore(s => s.clients);

  const localHandleExport = handleExport || (() => alert("Export not connected"));
  const localHandleImport = handleImport || (() => alert("Import not connected"));

  return (
    <div className="space-y-6 pb-24 pt-8 h-full w-full bg-[#0F1115]">
      <h2 className="px-2 text-xl font-black uppercase text-white">Инструменты</h2>

      <div className="space-y-4 rounded-[2.5rem] border border-white/5 bg-[#1E222A] p-6 text-white">
        <button
          type="button"
          onClick={localHandleExport}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 p-3 font-bold transition-all active:scale-95"
        >
          <CloudUpload size={18} className="text-[#6B5BAE]" />
          <span>Выгрузка данных</span>
        </button>

        <button
          type="button"
          onClick={() => {
             if(fileInputRef?.current) fileInputRef.current.click();
             else alert("FileInputRef is missing");
          }}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 p-3 font-bold transition-all active:scale-95"
        >
          <CloudDownload size={18} className="text-emerald-500" />
          <span>Загрузка данных</span>
        </button>

        <input
          data-form-type="other"
          autoComplete="off"
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={localHandleImport}
          className="hidden"
        />

        <div className="mx-2 h-px bg-white/5" />

        <button
          type="button"
          onClick={() => {
            if(setConfirmData) {
              setConfirmData({
                isOpen: true,
                message: "Стереть всё безвозвратно?",
                onConfirm: () => {
                  useAppStore.getState().clearAllData().then(() => {
                    Object.keys(localStorage)
                      .filter((key) => key.startsWith("kas_"))
                      .forEach((key) => localStorage.removeItem(key));
                    window.location.reload();
                  });
                },
              });
            } else {
              alert("setConfirmData is missing");
            }
          }}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500/10 p-3 font-bold text-red-500 transition-all active:scale-95"
        >
          <Trash2 size={18} />
          <span>Полная очистка</span>
        </button>

        <div className="pt-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
          Версия {APP_VERSION}
        </div>
      </div>
    </div>
  );
}
