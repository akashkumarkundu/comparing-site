<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Metrics Dashboard — Compare Anything</title>
    <meta name="description" content="Anonymous product analytics dashboard for Compare Anything. Tracks usage volume, success rate and categories with zero private data.">
    <link rel="icon" type="image/png" href="/icons/icon48.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-dark: #090d16;
            --bg-card: rgba(17, 24, 39, 0.75);
            --bg-card-hover: rgba(30, 41, 59, 0.6);
            --border-glass: rgba(255, 255, 255, 0.08);
            --primary: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            padding: 2.5rem 1.5rem;
        }
        .container { max-width: 1100px; margin: 0 auto; }
        .top-nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .brand-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
        }
        .brand-icon {
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            font-weight: 800;
        }
        .page-badge {
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .header-title-block {
            margin-bottom: 2rem;
        }
        .header-title-block h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 0.25rem;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .header-title-block p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }

        /* Stat Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 1rem;
            padding: 1.5rem;
            backdrop-filter: blur(12px);
            transition: all 0.2s ease;
        }
        .stat-card:hover {
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
        }
        .stat-label {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
        }
        .stat-value {
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.1;
        }
        .stat-subtext {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.5rem;
        }
        .stat-badge-up {
            color: var(--success);
            font-weight: 600;
        }

        /* Two Column Layout */
        .two-column-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        @media (max-width: 820px) {
            .two-column-grid { grid-template-columns: 1fr; }
        }

        .panel-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 1rem;
            padding: 1.5rem;
            backdrop-filter: blur(12px);
        }
        .panel-card h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .category-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.65rem 0.85rem;
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.5);
            margin-bottom: 0.6rem;
            border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .category-name {
            font-size: 0.9rem;
            font-weight: 500;
            color: #e2e8f0;
        }
        .category-count {
            background: rgba(59, 130, 246, 0.18);
            color: #60a5fa;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.2rem 0.55rem;
            border-radius: 9999px;
        }

        .privacy-box {
            background: rgba(16, 185, 129, 0.06);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 0.85rem;
            padding: 1.25rem;
        }
        .privacy-box h3 {
            color: #34d399;
            font-size: 0.95rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .privacy-box p {
            color: #94a3b8;
            font-size: 0.85rem;
            line-height: 1.5;
            margin-bottom: 0.5rem;
        }

        /* Activity Table */
        .table-card {
            background: var(--bg-card);
            border: 1px solid var(--border-glass);
            border-radius: 1rem;
            overflow: hidden;
            backdrop-filter: blur(12px);
        }
        .table-header {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--border-glass);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .table-header h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
        }
        .table-responsive {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            text-align: left;
        }
        th {
            background: rgba(15, 23, 42, 0.7);
            color: var(--text-muted);
            font-weight: 600;
            padding: 0.75rem 1.25rem;
            border-bottom: 1px solid var(--border-glass);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }
        td {
            padding: 0.85rem 1.25rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            color: #cbd5e1;
        }
        tr:hover td {
            background-color: var(--bg-card-hover);
        }
        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 0.2rem 0.55rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .status-pill.success {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-pill.failed {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .mono {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Navigation -->
        <nav class="top-nav">
            <a href="{{ route('home') }}" class="brand-header">
                <div class="brand-icon">CA</div>
                <span>Compare Anything</span>
            </a>
            <div style="display: flex; gap: 10px; align-items: center;">
                <span class="page-badge">● PDF Section 32 Analytics</span>
                <a href="{{ route('home') }}" style="color: var(--text-muted); font-size: 0.85rem; text-decoration: none;">← Back to Home</a>
            </div>
        </nav>

        <!-- Header Block -->
        <div class="header-title-block">
            <h1>Admin Metrics Dashboard</h1>
            <p>Real-time anonymous product telemetry & capacity health monitoring</p>
        </div>

        <!-- 4 Primary Metric Cards (PDF Section 32) -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Users Today</div>
                <div class="stat-value">{{ number_format($usersToday) }}</div>
                <div class="stat-subtext">Unique installations active today</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Comparisons Today</div>
                <div class="stat-value" style="color: #60a5fa;">{{ number_format($comparisonsToday) }}</div>
                <div class="stat-subtext">Total all-time: <strong>{{ number_format($totalComparisons) }}</strong></div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Success Rate</div>
                <div class="stat-value" style="color: #34d399;">{{ $successRate }}%</div>
                <div class="stat-subtext">{{ $successfulCount }} passed, {{ $failedCount }} errors</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Avg Pages / Speed</div>
                <div class="stat-value" style="color: #fbbf24;">{{ $averagePages }} <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 500;">pages</span></div>
                <div class="stat-subtext">Avg latency: <strong>{{ $avgDurationMs ? number_format($avgDurationMs) . ' ms' : 'N/A' }}</strong></div>
            </div>
        </div>

        <!-- Two Column Content -->
        <div class="two-column-grid">
            <!-- Top Categories -->
            <div class="panel-card">
                <h2>
                    <span>Most Common Categories</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">Top Domains</span>
                </h2>
                @forelse($commonCategories as $cat)
                    <div class="category-item">
                        <span class="category-name">{{ $cat->category }}</span>
                        <span class="category-count">{{ $cat->count }} comps</span>
                    </div>
                @empty
                    <div style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">
                        No comparison records yet. Run your first comparison to populate categories!
                    </div>
                @endforelse
            </div>

            <!-- Privacy Guarantee Notice -->
            <div class="panel-card">
                <h2>
                    <span>Zero Data Logging Guarantee</span>
                    <span class="page-badge" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #34d399;">100% Private</span>
                </h2>
                <div class="privacy-box">
                    <h3>Section 26 & 32 Compliance</h3>
                    <p>• <strong>No Webpage Content:</strong> Raw extracted page text, HTML, and scraped specifications are never logged or stored.</p>
                    <p>• <strong>No User Goal Text:</strong> What matters to users is processed in-memory and promptly discarded.</p>
                    <p>• <strong>Hashed Identifier:</strong> Install IDs are hashed using one-way SHA-256 for quota counting only.</p>
                    <p>• <strong>Audited:</strong> Verified compliant with Chrome Web Store User Data Disclosures.</p>
                </div>
            </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="table-card">
            <div class="table-header">
                <h2>Recent Comparison Activity</h2>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Last 12 Comparisons</span>
            </div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Request ID</th>
                            <th>Pages</th>
                            <th>Category</th>
                            <th>Model</th>
                            <th>Duration</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentComparisons as $comp)
                            <tr>
                                <td style="color: var(--text-muted);">{{ $comp->created_at->diffForHumans() }}</td>
                                <td class="mono" style="color: #60a5fa;">{{ substr($comp->request_id, 0, 8) }}...</td>
                                <td>{{ $comp->pages_count }} tabs</td>
                                <td><strong>{{ $comp->category ?? 'General' }}</strong></td>
                                <td class="mono" style="font-size: 0.75rem; color: var(--text-muted);">{{ $comp->model ?? 'groq' }}</td>
                                <td class="mono">{{ $comp->duration_ms ? number_format($comp->duration_ms) . ' ms' : '—' }}</td>
                                <td>
                                    @if($comp->is_successful)
                                        <span class="status-pill success">● Success</span>
                                    @else
                                        <span class="status-pill failed" title="{{ $comp->error_message }}">✕ Error</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                                    No activity recorded yet. Compare webpages using the extension to see live metrics here!
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
