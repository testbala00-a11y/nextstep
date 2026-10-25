export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NextStep — Something went wrong</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f8fafc;
      color: #0f2b5b;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      max-width: 420px;
    }
    a {
      display: inline-block;
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      border-radius: 8px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>NextStep</h1>
    <h2>Something went wrong</h2>
    <p>We couldn't load this page. Please try again.</p>
    <a href="/">Return to Home</a>
  </div>
</body>
</html>`;
}
