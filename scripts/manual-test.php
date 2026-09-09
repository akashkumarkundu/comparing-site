<?php

declare(strict_types=1);

require_once __DIR__.'/../vendor/autoload.php';

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$groqKey = (string) config('ai.providers.groq.api_key', '');
if ($groqKey === '' && config('ai.default') === 'groq') {
    echo "💡 Note: GROQ_API_KEY is not set in .env yet. Running manual test with local 'mock' provider.\n";
    echo "   (To use live Groq AI, add your GROQ_API_KEY=gsk_... in .env)\n\n";
    config(['ai.default' => 'mock']);
}

echo "\n==================================================================\n";
echo "🔍 COMPARE ANYTHING - DAY 2 MANUAL API TESTER\n";
echo "==================================================================\n\n";

// Sample 2 real product pages
$page1 = [
    'id' => 'page-1',
    'url' => 'https://www.startech.com.bd/asus-vivobook-15-x1504va',
    'domain' => 'startech.com.bd',
    'title' => 'ASUS Vivobook 15 X1504VA Core i5 13th Gen 15.6" Laptop',
    'description' => 'Intel Core i5-1335U, 16GB DDR4 RAM, 512GB NVMe PCIe SSD',
    'importantText' => "Price: Tk 74,500\nProcessor: Intel Core i5-1335U (10 Cores, up to 4.6GHz)\nRAM: 16GB DDR4\nStorage: 512GB NVMe SSD\nDisplay: 15.6 Inch Full HD (1920x1080)\nWarranty: 2 Years\nWeight: Not stated",
];

$page2 = [
    'id' => 'page-2',
    'url' => 'https://www.ryans.com/lenovo-ideapad-slim-3-15abr8',
    'domain' => 'ryans.com',
    'title' => 'Lenovo IdeaPad Slim 3 15ABR8 AMD Ryzen 7 7730U 15.6" Laptop',
    'description' => 'AMD Ryzen 7 7730U, 16GB DDR4 RAM, 512GB M.2 NVMe SSD',
    'importantText' => "Price: Tk 78,000\nProcessor: AMD Ryzen 7 7730U (8 Cores, 16 Threads, up to 4.5GHz)\nRAM: 16GB DDR4\nStorage: 512GB M.2 NVMe SSD\nDisplay: 15.6 Inch Full HD (1920x1080)\nWarranty: 2 Years\nWeight: 1.63 kg",
];

$payload = [
    'installId' => 'manual-test-client-guid-'.bin2hex(random_bytes(4)),
    'goal' => 'Best laptop for programming under Tk 80,000',
    'pages' => [$page1, $page2],
];

echo "📡 Sending POST /api/v1/compare request...\n";
echo "• Install ID : {$payload['installId']}\n";
echo "• User Goal  : {$payload['goal']}\n";
echo "• Page 1     : {$page1['title']} ({$page1['domain']})\n";
echo "• Page 2     : {$page2['title']} ({$page2['domain']})\n\n";

$request = Request::create(
    uri: '/api/v1/compare',
    method: 'POST',
    parameters: [],
    cookies: [],
    files: [],
    server: ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'],
    content: json_encode($payload, JSON_THROW_ON_ERROR)
);

$response = $app->handle($request);
$statusCode = $response->getStatusCode();
$body = json_decode($response->getContent(), true);

echo "------------------------------------------------------------------\n";
echo "📥 RESPONSE RECEIVED (HTTP Status: {$statusCode})\n";
echo "------------------------------------------------------------------\n\n";

if ($statusCode === 200 && ($body['success'] ?? false)) {
    $data = $body['data'];

    echo '🏆 Comparison Title : '.($data['comparisonTitle'] ?? 'N/A')."\n";
    echo '🏷️  Category Type     : '.($data['comparisonType'] ?? 'N/A')."\n";
    echo '🎯 User Priority     : '.($data['goal'] ?? 'N/A')."\n\n";

    echo "🥇 BEST OVERALL:\n";
    echo '   Winner ID : '.($data['bestOverall']['itemId'] ?? 'No clear winner')."\n";
    echo '   Reason    : '.($data['bestOverall']['reason'] ?? 'N/A')."\n\n";

    echo "📊 COMPARISON TABLE:\n";
    printf("   %-22s | %-24s | %-24s\n", 'Feature', 'ASUS Vivobook', 'Lenovo IdeaPad');
    echo "   -----------------------+--------------------------+-------------------------\n";
    foreach ($data['criteria'] ?? [] as $criterion) {
        $name = $criterion['name'] ?? '';
        $val1 = $criterion['values'][0]['value'] ?? 'Not stated';
        $val2 = $criterion['values'][1]['value'] ?? 'Not stated';
        printf("   %-22s | %-24s | %-24s\n", substr($name, 0, 22), substr($val1, 0, 24), substr($val2, 0, 24));
    }
    echo "\n";

    echo "⭐ BEST FOR:\n";
    foreach ($data['bestFor'] ?? [] as $bf) {
        echo "   • {$bf['label']}: {$bf['reason']}\n";
    }
    echo "\n";

    echo "💡 KEY DIFFERENCES:\n";
    foreach ($data['keyDifferences'] ?? [] as $diff) {
        echo "   • {$diff}\n";
    }
    echo "\n";

    echo "⚠️ MISSING INFORMATION (Handled cleanly as 'Not stated'):\n";
    foreach ($data['missingInformation'] ?? [] as $missing) {
        $fields = implode(', ', $missing['fields'] ?? []);
        echo "   • Item {$missing['itemId']}: {$fields}\n";
    }

    echo "\n==================================================================\n";
    echo "✅ MANUAL TEST SUCCESSFUL! Valid structured JSON generated.\n";
    echo "==================================================================\n";
} else {
    echo '❌ Request Error: '.($body['message'] ?? 'Unknown error')."\n";
    print_r($body);
}
