import React from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label: string;
  readOnly?: boolean;
  height?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder,
  label,
  readOnly = false,
  height = "h-64"
}) => {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full ${height} p-4 bg-gray-900 border border-gray-800 rounded-lg 
          font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 
          focus:border-transparent resize-none transition-all duration-200
          placeholder-gray-600 selection:bg-indigo-500/30
          ${readOnly ? 'opacity-80 cursor-default' : ''}`}
        spellCheck={false}
      />
    </div>
  );
};