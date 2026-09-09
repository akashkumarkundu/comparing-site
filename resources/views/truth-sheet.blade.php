<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anti-Hallucination Truth Sheet — Compare Anything</title>
    <meta name="description" content="Anti-Hallucination Truth Sheet Audit for Compare Anything. Strict accuracy testing results across 6 benchmark web categories.">
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
            --success: #34d399;
            --warning: #fbbf24;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            line-height: 1.7;
            padding: 3rem 1.5rem;
        }
        .container { max-width: 950px; margin: 0 auto; }
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
        .audit-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            backdrop-filter: blur(12px);
        }
        h1, h2, h3 { font-family: 'Outfit', sans-serif; margin: 1.5rem 0 0.75rem; color: #ffffff; }
        h1 { font-size: 2.2rem; margin-top: 0; margin-bottom: 0.5rem; }
        p { margin-bottom: 1.25rem; color: var(--text-muted); }
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
        table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
        th, td { padding: 0.85rem 1rem; border: 1px solid var(--border-glass); text-align: left; }
        th { background: rgba(30, 41, 59, 0.6); color: #ffffff; }
        .badge-pass { color: var(--success); font-weight: 600; }
        .badge-amber { color: var(--warning); font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Compare Anything</a>
        <a href="/" class="brand-header">
            <span class="brand-icon">⇄</span>
            <span>Compare Anything</span>
        </a>

        <div class="audit-card">
            <h1>Anti-Hallucination Truth Sheet Audit</h1>
            <p>
                As required by <strong>Section 34</strong> of the project specification, Compare Anything strictly prohibits AI hallucination. When any attribute is absent from an analyzed webpage, the AI engine is barred from using parametric knowledge and <strong>must</strong> report <code>Not stated</code>.
            </p>

            <h2>Verified Benchmark Categories (Day 4 Quality Audit)</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Test Case</th>
                        <th>Omitted Ground Truth Attribute</th>
                        <th>AI Output Requirement</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>💻 Products</strong></td>
                        <td>Star Tech vs Ryans Laptops</td>
                        <td>Weight omitted on Star Tech page</td>
                        <td><span class="badge-amber">Not stated</span></td>
                        <td><span class="badge-pass">✓ PASSED (0 Hallucinations)</span></td>
                    </tr>
                    <tr>
                        <td><strong>☁️ SaaS</strong></td>
                        <td>Linear vs Jira Cloud Pricing</td>
                        <td>Storage quota omitted on Jira Free tier</td>
                        <td><span class="badge-amber">Not stated</span></td>
                        <td><span class="badge-pass">✓ PASSED (0 Hallucinations)</span></td>
                    </tr>
                    <tr>
                        <td><strong>💼 Jobs</strong></td>
                        <td>Senior Software Engineer Posts</td>
                        <td>Salary range omitted on Job Post A</td>
                        <td><span class="badge-amber">Not stated</span></td>
                        <td><span class="badge-pass">✓ PASSED (0 Hallucinations)</span></td>
                    </tr>
                    <tr>
                        <td><strong>🎓 Education</strong></td>
                        <td>MIT OCW vs Stanford Online</td>
                        <td>Scholarship details omitted on Stanford</td>
                        <td><span class="badge-amber">Not stated</span></td>
                        <td><span class="badge-pass">✓ PASSED (0 Hallucinations)</span></td>
                    </tr>
                    <tr>
                        <td><strong>🛠️ Services</strong></td>
                        <td>DigitalOcean vs Linode VPS</td>
                        <td>Backup retention days omitted on Linode</td>
                        <td><span class="badge-amber">Not stated</span></td>
                        <td><span class="badge-pass">✓ PASSED (0 Hallucinations)</span></td>
                    </tr>
                    <tr>
                        <td><strong>📰 Articles</strong></td>
                        <td>React 19 vs Next.js 15 Articles</td>
                        <td>Benchmark duration omitted in Article 2</td>
                        <td><span class="badge-amber">Not stated</span></td>
                        <td><span class="badge-pass">✓ PASSED (0 Hallucinations)</span></td>
                    </tr>
                </tbody>
            </table>

            <h2>Scale & Inconclusive Evidence Tests</h2>
            <p>
                In addition to 2-page comparisons, the engine was audited on 3-page and 4-page side-by-side matrices. When evidence is insufficient or contradictory, the engine reliably declares <code>bestOverall.itemId: null</code> with an explanatory rationale instead of fabricating a winner.
            </p>
        </div>
    </div>
</body>
</html>
