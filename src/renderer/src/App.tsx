import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Settings, Database, Terminal, Server, Folder } from 'lucide-react'
import SettingsModal from './components/SettingsModal'
import JsonOutput from './components/JsonOutput'

function App(): React.JSX.Element {
  const [code, setCode] = useState('<?php\n\n// Write your PHP code here\necho "Hello from Tinkerwell Clone!";\n')
  const [output, setOutput] = useState('Output will appear here...')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [projectPath, setProjectPath] = useState<string | null>(null)

  const handleRun = async () => {
    setOutput('Running...')
    try {
      const result = await window.electron.ipcRenderer.invoke('run-php', { code, projectPath })
      setOutput(result)
    } catch (err: any) {
      setOutput(`Error: ${err.message}`)
    }
  }

  const handleSelectProject = async () => {
    const path = await window.electron.ipcRenderer.invoke('dialog:openDirectory')
    if (path) {
      setProjectPath(path)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-slate-300 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-3 bg-zinc-900 border-b border-zinc-800 shadow-sm" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="flex items-center gap-2 pl-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 font-semibold text-zinc-100 tracking-wide">TinkerClone</span>
        </div>

        <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button
            onClick={handleSelectProject}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-md text-zinc-300 border border-zinc-700 max-w-[200px]"
            title={projectPath || "Select Project directory"}
          >
            <Folder size={16} className="text-indigo-400" />
            <span className="truncate">{projectPath ? projectPath.split('\\').pop() : 'Select Project'}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Settings size={18} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-md text-zinc-300">
            <Server size={16} />
            <span>Local</span>
          </button>
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-md text-white shadow-md"
          >
            <Play size={16} fill="currentColor" />
            <span>Run</span>
          </button>
        </div>
      </header>

      {/* Warning bar when no project selected */}
      {!projectPath && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/40 border-b border-amber-700/50 text-amber-300 text-xs">
          <Folder size={13} className="shrink-0" />
          <span>No project selected — Click <strong>"Select Project"</strong> to choose your Laravel project folder and enable Eloquent, DB, and framework features.</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="w-1/2 flex flex-col border-r border-zinc-800">
          <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono uppercase tracking-widest">
            <Terminal size={14} className="mr-2 inline" /> Code
          </div>
          <div className="flex-1 pt-2">
            <Editor
              height="100%"
              defaultLanguage="php"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              beforeMount={(monaco) => {
                // Register PHP completions including Laravel helpers
                monaco.languages.registerCompletionItemProvider('php', {
                  triggerCharacters: ['$', '-', ':', '\\'],
                  provideCompletionItems: (model, position) => {
                    const wordInfo = model.getWordUntilPosition(position)
                    const range = {
                      startLineNumber: position.lineNumber,
                      endLineNumber: position.lineNumber,
                      startColumn: wordInfo.startColumn,
                      endColumn: wordInfo.endColumn,
                    }

                    const phpKeywords = [
                      'echo', 'print', 'return', 'require', 'require_once', 'include',
                      'include_once', 'function', 'class', 'namespace', 'use', 'new',
                      'if', 'else', 'elseif', 'foreach', 'for', 'while', 'do', 'switch',
                      'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw',
                      'static', 'public', 'private', 'protected', 'abstract', 'interface',
                      'extends', 'implements', 'null', 'true', 'false',
                    ]

                    const laravel = [
                      'App\\Models\\User::all()', 'App\\Models\\User::find($id)',
                      'App\\Models\\User::where(', 'App\\Models\\User::first()',
                      'App\\Models\\User::create([',
                      'DB::table(', 'DB::select(', 'DB::insert(',
                      'DB::update(', 'DB::delete(',
                      'Artisan::call(', 'Route::get(', 'Route::post(',
                      'config(', 'env(', 'storage_path(', 'base_path(',
                      'app_path(', 'public_path(', 'resource_path(',
                      'now()', 'today()', 'collect(', 'dd(', 'dump(', 'ddd(',
                      'auth()->user()', 'auth()->id()', 'auth()->check()',
                      'request()->get(', 'request()->input(',
                      'response()->json(', 'redirect()->to(',
                      'cache()->get(', 'cache()->put(',
                      'session()->get(', 'session()->put(',
                    ]

                    const phpFunctions = [
                      'array_map(', 'array_filter(', 'array_reduce(', 'array_keys(',
                      'array_values(', 'array_merge(', 'in_array(', 'count(',
                      'strlen(', 'str_contains(', 'str_starts_with(', 'str_ends_with(',
                      'strtolower(', 'strtoupper(', 'trim(', 'explode(', 'implode(',
                      'json_encode(', 'json_decode(', 'var_dump(', 'print_r(',
                      'date(', 'time(', 'mktime(', 'sprintf(', 'printf(',
                      'is_null(', 'is_array(', 'is_string(', 'is_int(', 'is_numeric(',
                      'isset(', 'empty(', 'unset(', 'intval(', 'floatval(', 'strval(',
                    ]

                    const allSuggestions = [
                      ...phpKeywords.map(kw => ({
                        label: kw,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: kw,
                        range,
                      })),
                      ...phpFunctions.map(fn => ({
                        label: fn.replace('(', ''),
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: fn,
                        range,
                      })),
                      ...laravel.map(lv => ({
                        label: lv.split('\\').pop()?.replace('(', '') || lv,
                        detail: '(Laravel)',
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: lv,
                        range,
                      })),
                    ]

                    return { suggestions: allSuggestions }
                  }
                })
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                wordWrap: "on",
                padding: { top: 10 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                tabSize: 4,
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                formatOnPaste: true,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Output Area */}
        <div className="w-1/2 flex flex-col bg-zinc-950">
          <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono uppercase tracking-widest">
            <Database size={14} className="mr-2 inline" /> Output
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <JsonOutput value={output} />
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

export default App
