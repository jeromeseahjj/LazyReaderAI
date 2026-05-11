export type ThemeName = "default";

type Theme = {
    name: ThemeName;
    tokens: Record<`--lr-${string}`, string>;
};

const themes: Record<ThemeName, Theme> = {
    default: {
        name: "default",
        tokens: {
            "--lr-bg": [
                "radial-gradient(circle at 20% 15%, rgba(216, 180, 254, 0.30), transparent 28%)",
                "radial-gradient(circle at 90% 5%, rgba(129, 140, 248, 0.32), transparent 32%)",
                "linear-gradient(135deg, #12001f 0%, #2e1065 45%, #4c1d95 100%)",
            ].join(", "),
            "--lr-text": "#f8fafc",
            "--lr-muted": "rgba(226, 232, 240, 0.72)",
            "--lr-card-bg": "rgba(255, 255, 255, 0.10)",
            "--lr-card-border": "rgba(255, 255, 255, 0.18)",
            "--lr-accent": "#c084fc",
            "--lr-accent-strong": "#a855f7",
            "--lr-danger": "#fecaca",
            "--lr-bg-fallback": "#12001f",
            "--lr-badge-bg": "rgba(255, 255, 255, 0.10)"
        },
    },
};

export function applyTheme(name: ThemeName = "default") {
    const theme = themes[name];

    for (const [key, value] of Object.entries(theme.tokens)) {
        document.documentElement.style.setProperty(key, value);
    }

    document.body.dataset.theme = name;
}