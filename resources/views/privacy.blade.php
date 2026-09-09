<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy — Compare Anything</title>
    <meta name="description" content="Privacy Policy for Compare Anything Chrome Extension. Read about our zero-tracking, activeTab-only data policy.">
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
        .policy-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            backdrop-filter: blur(12px);
        }
        h1, h2, h3 { font-family: 'Outfit', sans-serif; margin: 1.5rem 0 0.75rem; color: #ffffff; }
        h1 { font-size: 2.2rem; margin-top: 0; margin-bottom: 0.5rem; }
        p { margin-bottom: 1.25rem; color: var(--text-muted); }
        ul { margin-bottom: 1.25rem; padding-left: 1.5rem; color: var(--text-muted); }
        li { margin-bottom: 0.5rem; }
        code { font-family: 'JetBrains Mono', monospace; background: rgba(255, 255, 255, 0.08); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: #60a5fa; }
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

        <div class="policy-card">
            <h1>Privacy Policy</h1>
            <p><strong>Effective Date:</strong> September 9, 2026 • <strong>Last Updated:</strong> September 9, 2026</p>

            <h2>1. Single Purpose Declaration</h2>
            <p>
                <strong>Compare Anything</strong> has a single, well-defined purpose: to compare information from webpages explicitly selected by the user and generate a structured, side-by-side comparison.
            </p>

            <h2>2. User-Initiated Data Collection Only</h2>
            <p>
                The extension accesses webpage content <strong>only when you explicitly click</strong> <code>[+ ADD TO COMPARISON]</code> on an active tab. It utilizes the <code>activeTab</code> permission to provide temporary, one-time read access to the current page. We have zero background access to your other tabs, closed browsing sessions, or browsing history.
            </p>

            <h2>3. What Information is Extracted</h2>
            <ul>
                <li>Webpage URL and Domain Name</li>
                <li>Page Title and Meta Description</li>
                <li>Public Schema.org / JSON-LD structured product specifications</li>
                <li>Visible specification tables and definition lists (limited to ~3,500 characters)</li>
            </ul>
            <p>
                <strong>What We NEVER Collect:</strong> No passwords, login cookies, session tokens, form input fields, bookmarks, or credit cards.
            </p>

            <h2>4. AI Processing & Zero Storage</h2>
            <p>
                When you click <code>[ COMPARE ]</code>, extracted text is securely transmitted over HTTPS to our backend AI engine (Groq / OpenRouter) strictly to generate the comparison table. We do <strong>not</strong> permanently store your webpage content or comparisons on our servers.
            </p>

            <h2>5. Minimal Permissions</h2>
            <p>
                Our <code>manifest.json</code> requests only three minimal permissions:
            </p>
            <ul>
                <li><code>activeTab</code>: One-time access to the current page upon clicking the popup.</li>
                <li><code>scripting</code>: Executes extraction of visible tables upon user click.</li>
                <li><code>storage</code>: Locally stores your 2 to 4 selected pages in <code>chrome.storage.local</code>.</li>
            </ul>

            <h2>6. Contact</h2>
            <p>
                For questions regarding this policy, contact Akash Kumar Kundu at <a href="mailto:akashkumarkundu2102121@gmail.com" style="color: #60a5fa;">akashkumarkundu2102121@gmail.com</a>.
            </p>
        </div>
    </div>
</body>
</html>
