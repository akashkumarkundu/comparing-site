<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support & FAQ — Compare Anything</title>
    <meta name="description" content="Support and FAQ for Compare Anything Chrome Extension. Learn how to compare 2-4 pages, export to CSV, and report issues.">
    <link rel="icon" type="image/png" href="/icons/icon48.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-dark: #090d16;
            --bg-card: rgba(17, 24, 39, 0.75);
            --border-glass: rgba(255, 255, 255, 0.08);
            --primary: #3b82f6;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            line-height: 1.7;
            padding: 3rem 1.5rem;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .brand-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 2.5rem;
            text-decoration: none;
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
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
        }
        .support-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            backdrop-filter: blur(12px);
        }
        h1, h2, h3 { font-family: 'Outfit', sans-serif; margin: 1.5rem 0 0.75rem; color: #ffffff; }
        h1 { font-size: 2.2rem; margin-top: 0; margin-bottom: 0.5rem; }
        p { margin-bottom: 1.25rem; color: var(--text-muted); }
        .faq-item {
            border-bottom: 1px solid var(--border-glass);
            padding: 1.25rem 0;
        }
        .faq-item:last-child { border-bottom: none; }
        .faq-q { font-weight: 600; color: #f8fafc; margin-bottom: 0.4rem; font-size: 1.05rem; }
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
            margin-bottom: 1.5rem;
        }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Compare Anything</a>
        <a href="/" class="brand-header">
            <span class="brand-icon">⇄</span>
            <span>Compare Anything</span>
        </a>

        <div class="support-card">
            <h1>Support & Frequently Asked Questions</h1>
            <p>Need help or have questions about <strong>Compare Anything</strong>? Browse our answers below or reach out to our team directly.</p>

            <div class="faq-item">
                <div class="faq-q">1. How do I start comparing webpages?</div>
                <p>
                    Open the first webpage you want to compare, click the <strong>Compare Anything</strong> icon in your browser toolbar, and click <strong>[ + ADD TO COMPARISON ]</strong>. Then open another tab and repeat. Once you have queued 2 to 4 pages, click <strong>[ COMPARE ]</strong> to open the full decision table.
                </p>
            </div>

            <div class="faq-item">
                <div class="faq-q">2. What does "Not stated" in the comparison table mean?</div>
                <p>
                    Compare Anything strictly follows our Anti-Hallucination Policy. If a retailer or website does not provide a specification (such as battery capacity or warranty terms), the AI engine explicitly reports <strong>"Not stated"</strong> rather than guessing.
                </p>
            </div>

            <div class="faq-item">
                <div class="faq-q">3. Can I export or share my comparison results?</div>
                <p>
                    Yes! At the top of the comparison results page, you can click <strong>Copy Comparison</strong> to copy a formatted Markdown table to your clipboard, or <strong>Download CSV</strong> to open your findings in Excel or Google Sheets.
                </p>
            </div>

            <div class="faq-item">
                <div class="faq-q">4. What are the daily usage limits?</div>
                <p>
                    To maintain speed and prevent automated abuse, users can run up to <strong>10 free comparisons per day</strong>.
                </p>
            </div>

            <div class="faq-item">
                <div class="faq-q">5. How do I report a bug or request a feature?</div>
                <p>
                    Open an issue on our <a href="https://github.com/akashkumarkundu/comparing-site/issues" target="_blank" rel="noopener" style="color: #60a5fa;">GitHub Issues Tracker</a> or email the lead developer at <a href="mailto:akashkumarkundu2102121@gmail.com" style="color: #60a5fa;">akashkumarkundu2102121@gmail.com</a>.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
