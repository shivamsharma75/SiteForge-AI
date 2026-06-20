export const colorPalettes = {
    'professional-blue': {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#60a5fa'
    },
    'purple-modern': {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        accent: '#c084fc'
    },
    'startup-green': {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#6ee7b7'
    },
    'black-gold': {
        primary: '#d97706',
        secondary: '#f59e0b',
        accent: '#fcd34d'
    }
}

export const themes = {
    'dark': {
        dark: '#0d0d0d',
        light: '#f8f8f8',
        gray: '#333333',
        extraCSS: ''
    },
    'light': {
        dark: '#f8f8f8',
        light: '#0d0d0d',
        gray: '#cccccc',
        extraCSS: ''
    },
    'minimal': {
        dark: '#ffffff',
        light: '#111111',
        gray: '#e5e7eb',
        extraCSS: `
            body, section, div, header, footer {
                border-color: var(--gray) !important;
            }
        `
    },
    'corporate': {
        dark: '#0f172a',
        light: '#f8fafc',
        gray: '#334155',
        extraCSS: ''
    },
    'cyberpunk': {
        dark: '#000000',
        light: '#00ff66',
        gray: '#1f2937',
        extraCSS: `
            body, section, div, header, footer {
                border-color: var(--primary) !important;
                box-shadow: 0 0 5px rgba(0, 255, 102, 0.1) !important;
            }
        `
    },
    'glassmorphism': {
        dark: '#0a051b',
        light: '#ffffff',
        gray: '#1e1b4b',
        extraCSS: `
            .card, div[class*="card"], header, footer, section {
                background: rgba(255, 255, 255, 0.03) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
            }
        `
    }
}

export const fonts = {
    'inter': {
        importUrl: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');",
        family: "'Inter', sans-serif"
    },
    'poppins': {
        importUrl: "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');",
        family: "'Poppins', sans-serif"
    },
    'roboto': {
        importUrl: "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');",
        family: "'Roboto', sans-serif"
    },
    'montserrat': {
        importUrl: "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');",
        family: "'Montserrat', sans-serif"
    },
    'playfair': {
        importUrl: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');",
        family: "'Playfair Display', serif"
    }
}

export const animationPresets = {
    'fade-in': `
        section, .card, .hero {
            animation: sfFadeIn 0.8s ease-out forwards !important;
        }
        @keyframes sfFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `,
    'slide-up': `
        section, .card, .hero {
            animation: sfSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }
        @keyframes sfSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `,
    'hover-effects': `
        a:hover, button:hover, .card:hover, div[class*="card"]:hover {
            transform: translateY(-4px) scale(1.02) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
            transition: all 0.3s ease !important;
        }
    `,
    'parallax': `
        html { scroll-behavior: smooth !important; }
    `,
    'staggered': `
        section, .card, .hero {
            animation: sfFadeIn 0.8s ease-out forwards !important;
            opacity: 0;
        }
        section:nth-of-type(1), .card:nth-of-type(1) { animation-delay: 0.1s !important; }
        section:nth-of-type(2), .card:nth-of-type(2) { animation-delay: 0.2s !important; }
        section:nth-of-type(3), .card:nth-of-type(3) { animation-delay: 0.3s !important; }
        @keyframes sfFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `
}
