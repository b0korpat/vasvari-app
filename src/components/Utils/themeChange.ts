export function applyTheme(theme: string) {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    let isDarkMode = false;
    if (theme === "dark") {
        isDarkMode = true;
    } else if (theme === "system" && prefersDarkScheme.matches) {
        isDarkMode = true;
    }

    document.documentElement.classList.toggle("ion-palette-dark", isDarkMode);
    document.documentElement.classList.toggle("ion-palette-high-contrast", !isDarkMode);

    if (theme === "system") {
        prefersDarkScheme.addEventListener("change", () => {
            location.reload();
        });
    }
}