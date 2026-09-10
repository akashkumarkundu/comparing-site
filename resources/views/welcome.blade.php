<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compare Anything — AI-Powered Chrome Extension</title>
    <meta name="description" content="Stop switching between tabs. Compare 2 to 4 webpages side-by-side with zero hallucinations. Fast, structured AI comparisons with source evidence.">
    <link rel="icon" type="image/png" href="/icons/icon48.png">

    <!-- Modern Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-dark: #090d16;
            --bg-card: rgba(17, 24, 39, 0.75);
            --bg-card-hover: rgba(30, 41, 59, 0.85);
            --border-glass: rgba(255, 255, 255, 0.08);
            --border-highlight: rgba(59, 130, 246, 0.3);
            --primary: #3b82f6;
            --primary-glow: rgba(59, 130, 246, 0.25);
            --accent: #8b5cf6;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
            --warning: #f59e0b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
                radial-gradient(circle at 100% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 0% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 40%);
            background-attachment: fixed;
        }

        h1, h2, h3, .font-heading {
            font-family: 'Outfit', sans-serif;
            letter-spacing: -0.02em;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        /* Glassmorphism Card */
        .glass-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
            border-color: var(--border-highlight);
            transform: translateY(-2px);
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px -10px var(--primary-glow);
        }

        /* Buttons */
        .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            font-weight: 600;
            padding: 0.85rem 1.75rem;
            border-radius: 0.75rem;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            box-shadow: 0 6px 25px rgba(37, 99, 235, 0.5);
            transform: translateY(-1px);
        }

        .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            background: rgba(30, 41, 59, 0.6);
            color: var(--text-main);
            font-weight: 500;
            padding: 0.85rem 1.75rem;
            border-radius: 0.75rem;
            text-decoration: none;
            border: 1px solid var(--border-glass);
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
        }

        .btn-secondary:hover {
            background: rgba(51, 65, 85, 0.8);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }

        /* Navigation */
        nav {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(9, 13, 22, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-glass);
            padding: 1rem 0;
        }

        .nav-inner {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: var(--text-main);
            font-size: 1.25rem;
            font-weight: 700;
            font-family: 'Outfit', sans-serif;
        }

        .brand-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 1.75rem;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: #ffffff;
        }

        /* Hero Section */
        .hero {
            padding: 5.5rem 0 3rem;
            text-align: center;
            position: relative;
        }

        .pill-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.25);
            color: #60a5fa;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }

        .hero h1 {
            font-size: clamp(2.5rem, 5.5vw, 4.2rem);
            font-weight: 800;
            line-height: 1.15;
            margin-bottom: 1.5rem;
            background: linear-gradient(180deg, #ffffff 30%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p.lead {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 720px;
            margin: 0 auto 2.5rem;
            font-weight: 400;
        }

        .hero-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 4rem;
        }

        /* Interactive Flow Diagram */
        .flow-section {
            padding: 3rem 0;
        }

        .flow-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.25rem;
            position: relative;
            align-items: center;
        }

        .flow-card {
            padding: 1.75rem 1.25rem;
            text-align: center;
            position: relative;
        }

        .flow-step-num {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            margin: 0 auto 1rem;
        }

        .flow-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3b82f6;
            font-size: 1.5rem;
        }

        @media (max-width: 768px) {
            .flow-arrow {
                transform: rotate(90deg);
                margin: 0.5rem 0;
            }
        }

        /* Mockup Comparison Table */
        .preview-section {
            padding: 4rem 0;
        }

        .table-container {
            overflow-x: auto;
            border-radius: 1rem;
            border: 1px solid var(--border-glass);
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(16px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        }

        .comp-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.95rem;
        }

        .comp-table th, .comp-table td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--border-glass);
        }

        .comp-table th {
            background: rgba(30, 41, 59, 0.5);
            font-weight: 600;
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
        }

        .comp-table tr:last-child td {
            border-bottom: none;
        }

        .badge-winner {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.25rem 0.6rem;
            border-radius: 0.4rem;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .badge-missing {
            display: inline-flex;
            align-items: center;
            background: rgba(245, 158, 11, 0.15);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
            padding: 0.25rem 0.6rem;
            border-radius: 0.4rem;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .verdict-banner {
            background: linear-gradient(135deg, rgba(30, 58, 138, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 0.85rem;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }

        /* 3-Step Guide */
        .steps-section {
            padding: 4rem 0;
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.75rem;
            margin-top: 2.5rem;
        }

        .step-box {
            padding: 2.25rem 1.75rem;
            position: relative;
        }

        .step-icon-wrap {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1.25rem;
        }

        /* Categories Section */
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .cat-chip {
            padding: 1rem;
            text-align: center;
            font-weight: 500;
            border-radius: 0.75rem;
            border: 1px solid var(--border-glass);
            background: rgba(17, 24, 39, 0.5);
            transition: all 0.2s;
        }

        .cat-chip:hover {
            border-color: var(--border-highlight);
            background: rgba(30, 41, 59, 0.8);
            transform: translateY(-2px);
        }

        /* CTA Section */
        .download-cta {
            padding: 5rem 0;
            text-align: center;
        }

        .download-box {
            background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
            border: 1px solid var(--border-highlight);
            border-radius: 1.5rem;
            padding: 3.5rem 2rem;
            box-shadow: 0 0 50px -10px var(--primary-glow);
        }

        /* Footer */
        footer {
            border-top: 1px solid var(--border-glass);
            padding: 3rem 0 2rem;
            background: rgba(9, 13, 22, 0.95);
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-bottom: 2.5rem;
        }

        .footer-col h4 {
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            margin-bottom: 1rem;
            font-size: 1rem;
        }

        .footer-col ul {
            list-style: none;
        }

        .footer-col ul li {
            margin-bottom: 0.6rem;
        }

        .footer-col ul a {
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.2s;
        }

        .footer-col ul a:hover {
            color: #ffffff;
        }

        .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid var(--border-glass);
            padding-top: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
    </style>
</head>
<body>

    <!-- Top Navigation -->
    <nav>
        <div class="container nav-inner">
            <a href="/" class="brand">
                <span class="brand-icon">⇄</span>
                <span>Compare Anything</span>
            </a>
            <ul class="nav-links">
                <li><a href="#how-it-works">How it Works</a></li>
                <li><a href="#preview">Live Preview</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="/truth-sheet">Truth Sheet</a></li>
                <li><a href="/privacy">Privacy</a></li>
                <li><a href="/support">Support</a></li>
            </ul>
            <div>
                <a href="/download-extension" class="btn-primary" style="padding: 0.55rem 1.15rem; font-size: 0.88rem;">
                    <span>Download Extension</span>
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
        <div class="container">
            <div class="pill-badge">
                <span>🛡️ Stop switching between tabs. Compare them.</span>
            </div>
            <h1>Stop switching between tabs.<br><span style="color: #60a5fa;">Compare them.</span></h1>
            <p class="lead">
                Add 2 to 4 webpages from anywhere on the web and receive an instant, structured side-by-side comparison table powered by AI. No sign-up, no bloated chats, no invented facts.
            </p>
            <div class="hero-actions">
                <a href="/download-extension" class="btn-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5H8l4-4 4 4h-3v5h-2z"/>
                    </svg>
                    <span>Download Extension (.ZIP)</span>
                </a>
                <a href="https://github.com/akashkumarkundu/comparing-site" target="_blank" rel="noopener" class="btn-secondary">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <span>View GitHub Source</span>
                </a>
            </div>
        </div>
    </header>

    <!-- Visual Flow Diagram Section -->
    <section class="flow-section" id="how-it-works">
        <div class="container">
            <div style="text-align: center; margin-bottom: 2.5rem;">
                <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Seamless 3-Step Decision Engine</h2>
                <p style="color: var(--text-muted);">From chaotic browser tabs to one crystal-clear side-by-side decision in seconds.</p>
            </div>

            <div class="flow-grid">
                <div class="glass-card flow-card">
                    <div class="flow-step-num">1</div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📑</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Tab A</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">Open 1st page (e.g. Star Tech) & click <strong>Add to Compare</strong></p>
                </div>

                <div class="flow-arrow">→</div>

                <div class="glass-card flow-card">
                    <div class="flow-step-num">2</div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📑</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Tab B & C</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">Open 2nd or 3rd retailer/course and queue them up</p>
                </div>

                <div class="flow-arrow">→</div>

                <div class="glass-card flow-card" style="border-color: rgba(59, 130, 246, 0.4); background: rgba(30, 58, 138, 0.2);">
                    <div class="flow-step-num" style="background: rgba(59, 130, 246, 0.4);">⚡</div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🤖</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Compare Anything</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">Zero-hallucination AI extracts & normalizes key criteria</p>
                </div>

                <div class="flow-arrow">→</div>

                <div class="glass-card flow-card" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(6, 78, 59, 0.2);">
                    <div class="flow-step-num" style="background: rgba(16, 185, 129, 0.3); color: #34d399;">✓</div>
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Structured Verdict</h3>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">Winners highlighted, missing facts marked, ready to export</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Interactive Preview Section -->
    <section class="preview-section" id="preview">
        <div class="container">
            <div style="text-align: center; margin-bottom: 2.5rem;">
                <span class="pill-badge">Zero Guesswork</span>
                <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem;">High-End Buying Tool Aesthetic</h2>
                <p style="color: var(--text-muted); max-width: 650px; margin: 0 auto;">
                    Feels like Google Flights or a professional procurement dashboard, not a chatbot conversation.
                </p>
            </div>

            <!-- Quick Verdict Hero Card -->
            <div class="verdict-banner">
                <div style="font-size: 2rem;">👑</div>
                <div>
                    <div style="font-size: 0.85rem; color: #60a5fa; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
                        Quick AI Verdict & Best Overall
                    </div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.3rem;">ASUS Vivobook 15 X1504VA — Recommended for Programming</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">
                        Matches goal: Only contender featuring 16GB RAM out of the box and 13th Gen Intel Core i5 processor under Tk 80,000 budget.
                    </p>
                </div>
            </div>

            <!-- Table Showcase -->
            <div class="table-container">
                <table class="comp-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Criterion</th>
                            <th style="width: 25%;">ASUS Vivobook 15 <span style="font-size: 0.75rem; color: #94a3b8; display: block; font-weight: 400;">startech.com.bd</span></th>
                            <th style="width: 25%;">Lenovo IdeaPad Slim 3 <span style="font-size: 0.75rem; color: #94a3b8; display: block; font-weight: 400;">ryanscomputers.com</span></th>
                            <th style="width: 25%;">HP 15s-fq5321TU <span style="font-size: 0.75rem; color: #94a3b8; display: block; font-weight: 400;">techlandbd.com</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight: 600;">Price</td>
                            <td>Tk 74,500</td>
                            <td><span class="badge-winner">Tk 71,900 ✓ Lowest</span></td>
                            <td>Tk 76,000</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">Processor</td>
                            <td><span class="badge-winner">Intel i5-1335U (13th Gen) ✓</span></td>
                            <td>Intel i5-1235U (12th Gen)</td>
                            <td>Intel i5-1235U (12th Gen)</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">RAM Memory</td>
                            <td><span class="badge-winner">16GB DDR4 ✓ Winner</span></td>
                            <td>8GB DDR4 (Upgradable)</td>
                            <td>8GB DDR4</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">Storage</td>
                            <td>512GB NVMe PCIe SSD</td>
                            <td>512GB NVMe PCIe SSD</td>
                            <td>512GB NVMe PCIe SSD</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">Weight</td>
                            <td><span class="badge-missing">Not stated</span></td>
                            <td>1.63 kg</td>
                            <td>1.69 kg</td>
                        </tr>
                        <tr>
                            <td style="font-weight: 600;">Official Warranty</td>
                            <td>2 Years Official</td>
                            <td>2 Years Official</td>
                            <td>2 Years Official</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Export Preview -->
            <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 0.5rem; background: rgba(30, 41, 59, 0.5); border: 1px solid var(--border-glass); font-size: 0.85rem; color: var(--text-muted);">
                    📋 One-Click Copy Markdown
                </span>
                <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 0.5rem; background: rgba(30, 41, 59, 0.5); border: 1px solid var(--border-glass); font-size: 0.85rem; color: var(--text-muted);">
                    📥 Download Clean CSV
                </span>
            </div>
        </div>
    </section>

    <!-- Key Features Grid -->
    <section class="steps-section" id="features">
        <div class="container">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem;">Engineered for Absolute Accuracy</h2>
                <p style="color: var(--text-muted);">Built in accordance with strict single-purpose and privacy standards.</p>
            </div>

            <div class="steps-grid">
                <div class="glass-card step-box">
                    <div class="step-icon-wrap">🛡️</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Anti-Hallucination Policy</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem;">
                        If a website fails to mention weight, warranty, or battery specs, the AI strictly outputs <strong>"Not stated"</strong>. It never extrapolates or hallucinates facts.
                    </p>
                </div>

                <div class="glass-card step-box">
                    <div class="step-icon-wrap">🔒</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Minimal Permissions</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem;">
                        Only uses <code>activeTab</code> and <code>storage</code>. No persistent background access, no <code>&lt;all_urls&gt;</code>, and zero tracking of your browsing history.
                    </p>
                </div>

                <div class="glass-card step-box">
                    <div class="step-icon-wrap">🎯</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Goal-Aware Recommendations</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem;">
                        Optionally declare what matters to you (e.g. <em>"Best battery under $1,000"</em>) and the AI highlights the exact winner tailored to your criteria.
                    </p>
                </div>

                <div class="glass-card step-box">
                    <div class="step-icon-wrap">⚡</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Side-by-Side In Full Tab</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem;">
                        Comparisons open in a dedicated, distraction-free browser tab (`results.html`), never cramped inside a tiny extension popup window.
                    </p>
                </div>

                <div class="glass-card step-box">
                    <div class="step-icon-wrap">📊</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Export to CSV & Markdown</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem;">
                        Share your findings effortlessly. Copy structured markdown tables directly into Slack or Notion, or download spreadsheet-ready CSV files.
                    </p>
                </div>

                <div class="glass-card step-box">
                    <div class="step-icon-wrap">🚀</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">No Login Required</h3>
                    <p style="color: var(--text-muted); font-size: 0.92rem;">
                        Install and use immediately. No email verification, no password to remember, and no credit card required.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Supported Categories -->
    <section style="padding: 3rem 0;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.4rem;">Tested Across Every Decision Category</h3>
            </div>
            <div class="categories-grid">
                <div class="cat-chip">💻 Laptops & Tech</div>
                <div class="cat-chip">☁️ SaaS Pricing</div>
                <div class="cat-chip">💼 Job Descriptions</div>
                <div class="cat-chip">🎓 University Courses</div>
                <div class="cat-chip">🛠️ Cloud & Hosting</div>
                <div class="cat-chip">📰 Research Articles</div>
            </div>
        </div>
    </section>

    <!-- Download CTA Section -->
    <section class="download-cta" id="download">
        <div class="container">
            <div class="download-box">
                <span class="pill-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">
                    Free & Open Source
                </span>
                <h2 style="font-size: 2.8rem; margin: 1rem 0 1rem;">Start Comparing in 60 Seconds</h2>
                <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 2rem; font-size: 1.1rem;">
                    Download the production package and load it into Google Chrome Developer Mode today.
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <a href="/download-extension" class="btn-primary" style="font-size: 1.05rem; padding: 1rem 2.25rem;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5H8l4-4 4 4h-3v5h-2z"/>
                        </svg>
                        <span>Download Extension Package (.ZIP)</span>
                    </a>
                </div>

                <!-- How to install steps -->
                <div style="margin-top: 2.5rem; text-align: left; max-width: 650px; margin-left: auto; margin-right: auto; background: rgba(15, 23, 42, 0.6); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border-glass); font-size: 0.9rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: #60a5fa;">How to load into Chrome:</div>
                    <ol style="padding-left: 1.25rem; color: var(--text-muted); line-height: 1.8;">
                        <li>Unzip <code>compare-anything-extension.zip</code> on your computer.</li>
                        <li>Open Chrome and navigate to <code>chrome://extensions/</code>.</li>
                        <li>Enable <strong>Developer mode</strong> in the top right toggle.</li>
                        <li>Click <strong>Load unpacked</strong> and select the unzipped folder.</li>
                        <li>Pin <strong>Compare Anything</strong> to your toolbar and compare any page!</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col" style="grid-column: span 2;">
                    <div class="brand" style="margin-bottom: 0.75rem;">
                        <span class="brand-icon">⇄</span>
                        <span>Compare Anything</span>
                    </div>
                    <p style="color: var(--text-muted); max-width: 380px; font-size: 0.88rem; line-height: 1.6;">
                        AI-powered Chrome extension designed to compare 2 to 4 webpages side-by-side with zero hallucinations. Built with privacy and minimal permissions.
                    </p>
                </div>
                <div class="footer-col">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="/truth-sheet">Anti-Hallucination Audit</a></li>
                        <li><a href="/admin/metrics">Anonymous Metrics</a></li>
                        <li><a href="/support">Support & FAQ</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/download-extension">Direct ZIP Download</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Community & Code</h4>
                    <ul>
                        <li><a href="https://github.com/akashkumarkundu/comparing-site" target="_blank" rel="noopener">GitHub Repository</a></li>
                        <li><a href="https://github.com/akashkumarkundu/comparing-site/issues" target="_blank" rel="noopener">Report an Issue</a></li>
                        <li><a href="https://github.com/akashkumarkundu/comparing-site/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <div>
                    &copy; 2026 Akash Kumar Kundu. All rights reserved.
                </div>
                <div style="display: flex; gap: 1.5rem;">
                    <a href="/privacy" style="color: var(--text-muted); text-decoration: none;">Privacy Policy</a>
                    <a href="/support" style="color: var(--text-muted); text-decoration: none;">Support</a>
                    <a href="/truth-sheet" style="color: var(--text-muted); text-decoration: none;">Truth Sheet</a>
                </div>
            </div>
        </div>
    </footer>

</body>
</html>
