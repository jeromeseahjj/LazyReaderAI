export function extractTopKeywords(text: string, topK = 8): string[] {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return [];
    const stop = new Set([
        "the","a","an","and","or","but","if","then","else","to","of","in","on","for","with","as","at","by",
        "is","are","was","were","be","been","being","it","this","that","these","those","from","into","than",
        "you","your","we","our","they","their","i","me","my","he","she","his","her","them","there","here",
        "about","also","more","most","some","such","may","might","can","could","would","should",
    ]);

    const tokens = cleaned.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    const freq = new Map<string, number>();

    for (const t of tokens) {
        if (t.length <= 2) continue;
        if (stop.has(t)) continue;
        // ignore pure numbers to avoid "2025" dominating recommendations
        if (/^\d+$/.test(t)) continue;
        freq.set(t, (freq.get(t) ?? 0) + 1);
    }

    return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, topK)
        .map(([w]) => w);
}