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

export function summarizeExtractive(text: string, maxSentences = 5): string {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return "";

    // Split into sentence
    const sentences = cleaned
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 40);

    if (sentences.length === 0) return cleaned.slice(0, 500);

    // Tokenize & build word frequency map
    const stop = new Set([
        "the","a","an","and","or","but","if","then","else","to","of","in","on","for","with","as","at","by",
        "is","are","was","were","be","been","being","it","this","that","these","those","from","into","than",
        "you","your","we","our","they","their","i","me","my","he","she","his","her","them","there","here",
        "about","also","more","most","some","such","may","might","can","could","would","should",
    ]);

    // Old school NLP
    const wordFreq = new Map<string, number>();
    for (const s of sentences) {
        // IMPORTANT: match full words, not single chars
        for (const w of s.toLowerCase().match(/[a-z0-9']+/g) ?? []) {
            // Ignore redundant words
            if (w.length <= 2) continue;
            if (stop.has(w)) continue;
            // Capture statistic and keywords
            wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
        }
    }

    // Score sentences by sum of keyword frequencies, normalized by length
    const scored = sentences.map((s, idx) => {
        const words = s.toLowerCase().match(/[a-z0-9']+/g) ?? [];
        // This gives statistic a boost/higher score
        let score = /\d/.test(s) ? 5 : 0;
        for (const w of words) score += wordFreq.get(w) ?? 0;
        const norm = Math.max(8, words.length);
        // To prevent biasness from long sentences
        return { idx, s, score: score / norm };
    });

    // b - a, is positive, means b is bigger, b should come before a
    // if negative, means a should come before b
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(maxSentences, scored.length))
        .sort((a, b) => a.idx - b.idx)
        .map((x) => x.s)
        .join("\n\n");
}
