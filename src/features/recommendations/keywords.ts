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

export function extractTopPhrases(text: string, topK = 8): string[] {
    const stop = new Set([
        "the","a","an","and","or","but","if","then","else","to","of","in","on","for","with","as","at","by",
        "is","are","was","were","be","been","being","it","this","that","these","those","from","into","than",
        "you","your","we","our","they","their","i","me","my","he","she","his","her","them","there","here",
        "about","also","more","most","some","such","may","might","can","could","would","should",
        "who","what","when","where","why","how","which","whose","whom",
        "said","says","new","updated","update","put","puts","forward","flagship",
    ]);

    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 2)
        .filter((w) => !stop.has(w))
        .filter((w) => !/^\d+$/.test(w));

    const scores = new Map<string, number>();

    for (let size = 2; size <= 3; size++) {
        for (let i = 0; i <= words.length - size; i++) {
            const phrase = words.slice(i, i + size).join(" ");

            if (phrase.length < 8) continue;

            scores.set(phrase, (scores.get(phrase) ?? 0) + size);
        }
    }

    return [...scores.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, topK)
        .map(([phrase]) => phrase);
}