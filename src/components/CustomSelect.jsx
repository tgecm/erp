import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...', 
  className = '', 
  buttonClassName = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOpt = options.find(o => (typeof o === 'object' ? o.value : o) === value);
  const displayLabel = selectedOpt
    ? (typeof selectedOpt === 'object' ? selectedOpt.label : selectedOpt)
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-98 ${buttonClassName}`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#121215] border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            const isSelected = val === value;

            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-800 dark:text-slate-200 font-medium'
                }`}
              >
                <span className="truncate">{lbl}</span>
                {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
