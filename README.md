# Stock Buy/Sell Using Greedy Algorithm

A Flask-based stock analysis web app that fetches market data using Yahoo Finance and provides BUY/SELL/HOLD recommendations using technical indicators.

## Features

- Stock data fetching with automatic support for common Indian tickers (for example, `TCS -> TCS.NS`).
- Technical indicators:
  - `SMA_20` (20-day Simple Moving Average)
  - `SMA_50` (50-day Simple Moving Average)
  - `RSI` (14-day Relative Strength Index)
- Trading signal generation (`BUY`, `SELL`, `HOLD`) based on RSI and SMA crossover logic.
- Performance metrics:
  - Total trades
  - Profitable trades
  - Win rate
  - Total profit
- Interactive charts and recent-trades table on the frontend.
- Background refresh thread for cached stock data.

## Project Structure

```text
stock-buy-sell/
|- app.py
|- algorithms.py
|- templates/
|  |- index.html
|- static/
|  |- css/
|  |- js/
|  |- bootstrap.min.css
|  |- bootstrap.min.js
|  |- plotly-2.27.0.min.js
|  |- favicon.ico
```

## Requirements

- Python 3.10+ (project appears to run on Python 3.13 as well)
- pip

Python packages:

- `flask`
- `yfinance`
- `numpy`
- `pandas`

## Installation

```bash
git clone https://github.com/khushwantsingh007/stock-buy-sell.git
cd "stock-buy-sell"
python -m venv .venv
```

Activate virtual environment:

- **Windows (PowerShell)**

```powershell
.venv\Scripts\Activate.ps1
```

- **macOS/Linux**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install flask yfinance numpy pandas
```

## Run the App

```bash
python app.py
```

Then open:

- [http://127.0.0.1:5000](http://127.0.0.1:5000)

## How to Use

1. Enter a stock ticker (example: `AAPL`, `TCS`, `RELIANCE`).
2. Click **Analyze**.
3. View:
   - Recommendation (`BUY` / `SELL` / `HOLD`)
   - Price and indicator charts
   - Performance metrics
   - Recent trade entries

## API Endpoint

- `GET /api/stock/<ticker>`

Example:

```text
/api/stock/AAPL
```

Response includes:

- `prices` (OHLCV history)
- `indicators` (`SMA_20`, `SMA_50`, `RSI`)
- `signals` (recommendation + analysis)
- `last_updated`

## Notes

- This project is for educational/demo purposes and is not financial advice.
- Market data availability depends on Yahoo Finance.

## License

Add a license if you plan to distribute or allow reuse.
