interface JsonOutputProps {
    value: string
}

function colorizeJson(json: string): string {
    return json
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = 'json-number'
                if (/^"/.test(match)) {
                    cls = /:$/.test(match) ? 'json-key' : 'json-string'
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean'
                } else if (/null/.test(match)) {
                    cls = 'json-null'
                }
                return `<span class="${cls}">${match}</span>`
            }
        )
}

export default function JsonOutput({ value }: JsonOutputProps) {
    // Try to detect if the value contains JSON
    const trimmed = value.trim()

    // Look for the "=> " prefix from our PHP wrapper output
    const arrowIndex = trimmed.indexOf('\n=> ')
    const prefix = arrowIndex >= 0 ? trimmed.slice(0, arrowIndex) : ''
    const jsonPart = arrowIndex >= 0 ? trimmed.slice(arrowIndex + 4) : trimmed

    let formatted = ''
    let isJson = false

    try {
        // Try to parse as JSON
        const parsed = JSON.parse(jsonPart)
        formatted = JSON.stringify(parsed, null, 2)
        isJson = true
    } catch {
        // Not JSON, just display as text
        formatted = value
    }

    if (isJson) {
        return (
            <div className="font-mono text-sm h-full overflow-auto">
                {prefix && (
                    <pre className="text-zinc-300 mb-2 whitespace-pre-wrap">{prefix}</pre>
                )}
                <pre
                    className="whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: colorizeJson(formatted) }}
                    style={{ '--json-key': '#79b8ff', '--json-string': '#9ecbff', '--json-number': '#f8c555', '--json-boolean': '#f97583', '--json-null': '#6a737d' } as any}
                />
                <style>{`
          .json-key { color: #79b8ff; }
          .json-string { color: #9ecbff; }
          .json-number { color: #f8c555; }
          .json-boolean { color: #f97583; }
          .json-null { color: #6a737d; }
        `}</style>
            </div>
        )
    }

    return (
        <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap h-full">{value}</pre>
    )
}
