// Main app JavaScript file
const fetchBtn = document.getElementById('fetchBtn');
const tickerInput = document.getElementById('tickerInput');
const suggestions = document.getElementById('suggestions');
const stockTitle = document.getElementById('stockTitle');
const lastUpdated = document.getElementById('lastUpdated');
const recommendationBadge = document.getElementById('recommendationBadge');
const recommendationText = document.getElementById('recommendationText');
const recommendationDate = document.getElementById('recommendationDate');
const signalExplanation = document.getElementById('signalExplanation');
const tradesTableBody = document.getElementById('tradesTableBody');

let currentTicker = '';
let autoRefreshInterval = null;
let chartInstances = {};

// Stock database with popular stocks
const stockDatabase = {
    indian: [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
        { symbol: 'TCS', name: 'Tata Consultancy Services' },
        { symbol: 'INFY', name: 'Infosys Ltd.' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.' },
        { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.' },
        { symbol: 'SBIN', name: 'State Bank of India' },
        { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.' },
        { symbol: 'ITC', name: 'ITC Ltd.' },
        { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.' },
        { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.' },
        { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.' },
        { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.' },
        { symbol: 'TECHM', name: 'Tech Mahindra Ltd.' },
        { symbol: 'WIPRO', name: 'Wipro Ltd.' },
        { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.' },
        { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.' },
        { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.' },
        { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd.' },
        { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.' },
        { symbol: 'TITAN', name: 'Titan Company Ltd.' },
        { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.' },
        { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.' },
        { symbol: 'NESTLEIND', name: 'Nestle India Ltd.' },
        { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.' },
        { symbol: 'NTPC', name: 'NTPC Ltd.' },
        { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd.' },
        { symbol: 'COALINDIA', name: 'Coal India Ltd.' },
        { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.' },
        { symbol: 'IOC', name: 'Indian Oil Corporation Ltd.' },
        { symbol: 'GAIL', name: 'GAIL (India) Ltd.' },
        { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd.' },
        { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.' },
        { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.' },
        { symbol: 'ADANITRANS', name: 'Adani Transmission Ltd.' },
        { symbol: 'ADANIPOWER', name: 'Adani Power Ltd.' },
        { symbol: 'ZOMATO', name: 'Zomato Ltd.' },
        { symbol: 'PAYTM', name: 'One 97 Communications Ltd.' },
        { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Ltd.' },
        { symbol: 'PBFINTECH', name: 'PB Fintech Ltd.' }
    ],
    us: [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'MSFT', name: 'Microsoft Corporation' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.' },
        { symbol: 'TSLA', name: 'Tesla Inc.' },
        { symbol: 'META', name: 'Meta Platforms Inc.' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation' },
        { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
        { symbol: 'JNJ', name: 'Johnson & Johnson' },
        { symbol: 'V', name: 'Visa Inc.' },
        { symbol: 'PG', name: 'Procter & Gamble Co.' },
        { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
        { symbol: 'HD', name: 'Home Depot Inc.' },
        { symbol: 'MA', name: 'Mastercard Inc.' },
        { symbol: 'BAC', name: 'Bank of America Corp.' },
        { symbol: 'XOM', name: 'Exxon Mobil Corp.' },
        { symbol: 'CVX', name: 'Chevron Corp.' },
        { symbol: 'LLY', name: 'Eli Lilly and Co.' },
        { symbol: 'ABBV', name: 'AbbVie Inc.' },
        { symbol: 'PFE', name: 'Pfizer Inc.' },
        { symbol: 'COST', name: 'Costco Wholesale Corp.' },
        { symbol: 'KO', name: 'Coca-Cola Co.' },
        { symbol: 'PEP', name: 'PepsiCo Inc.' },
        { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
        { symbol: 'AVGO', name: 'Broadcom Inc.' },
        { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
        { symbol: 'ACN', name: 'Accenture plc' },
        { symbol: 'WMT', name: 'Walmart Inc.' },
        { symbol: 'DHR', name: 'Danaher Corp.' },
        { symbol: 'LIN', name: 'Lincoln Electric Holdings Inc.' },
        { symbol: 'NFLX', name: 'Netflix Inc.' }
    ]
};

// Format price in Indian Rupees
function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

// Convert USD to INR (current rate ~83.5)
function convertToINR(usdPrice) {
    const conversionRate = 83.5; // 1 USD = 83.5 INR (approximate)
    return usdPrice * conversionRate;
}

// Combine all stocks for searching
const allStocks = [...stockDatabase.indian, ...stockDatabase.us];

// Event listeners
fetchBtn.addEventListener('click', fetchStockData);
tickerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') fetchStockData();
});

// Autocomplete functionality
tickerInput.addEventListener('input', function(e) {
    const query = e.target.value.trim().toUpperCase();
    
    if (query.length < 1) {
        hideSuggestions();
        return;
    }
    
    const matches = searchStocks(query);
    showSuggestions(matches);
});

tickerInput.addEventListener('blur', function() {
    setTimeout(hideSuggestions, 200);
});

// Search stocks function
function searchStocks(query) {
    return allStocks.filter(stock => 
        stock.symbol.toUpperCase().includes(query) || 
        stock.name.toUpperCase().includes(query)
    ).slice(0, 10); // Limit to 10 suggestions
}

// Show suggestions dropdown
function showSuggestions(matches) {
    if (matches.length === 0) {
        hideSuggestions();
        return;
    }
    
    suggestions.innerHTML = matches.map(stock => `
        <div class="suggestion-item p-2 border-bottom border-secondary cursor-pointer hover-bg-secondary" 
             data-symbol="${stock.symbol}" 
             data-name="${stock.name}"
             style="cursor: pointer;">
            <div class="fw-bold text-primary">${stock.symbol}</div>
            <div class="small text-muted">${stock.name}</div>
        </div>
    `).join('');
    
    suggestions.style.display = 'block';
    
    // Add click handlers to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            tickerInput.value = this.dataset.symbol;
            hideSuggestions();
            fetchStockData();
        });
    });
}

// Hide suggestions dropdown
function hideSuggestions() {
    suggestions.style.display = 'none';
}

// Main function to fetch stock data
function fetchStockData() {
    const ticker = tickerInput.value.trim().toUpperCase();
    
    if (!ticker || ticker.length > 10) {
        showAlert('Please enter a valid stock ticker (1-10 characters)', 'danger');
        return;
    }
    
    currentTicker = ticker;
    stockTitle.textContent = `${ticker} Analysis`;
    
    // Clear previous refresh interval if exists
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    
    // Initial load
    loadData();
    
    // Set auto refresh
    autoRefreshInterval = setInterval(loadData, 60 * 1000); // Refresh every minute
}

// Function to load data from the API
function loadData() {
    showLoading(true);
    
    fetch(`/api/stock/${currentTicker}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Error fetching data (Status: ${response.status})`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            // Update UI with fetched data
            lastUpdated.textContent = `Last updated: ${data.last_updated}`;
            updateCharts(data);
            updateRecommendation(data.signals);
            updatePerformanceMetrics(data.signals.analysis);
            updateRecentTrades(data.signals.analysis.positions);
            
            // Show success message
            showAlert(`Successfully updated ${currentTicker} data`, 'success', 2000);
        })
        .catch(error => {
            console.error('Error:', error);
            showError(error.message);
        })
        .finally(() => showLoading(false));
}

// Function to update charts with new data
function updateCharts(data) {
    if (!data.prices || data.prices.length === 0) {
        console.error('No price data available');
        showAlert('No price data available for this ticker', 'warning');
        return;
    }

    try {
        const dates = data.prices.map(item => new Date(item.Date));
        let closes = data.prices.map(item => item.Close);
        
        // Convert USD to INR for US stocks
        const isUSStock = stockDatabase.us.some(stock => stock.symbol === currentTicker);
        if (isUSStock) {
            closes = closes.map(price => convertToINR(price));
        }

        // Get buy and sell signals
        const buySignals = data.signals.signals.filter(s => s.Signal === 'BUY');
        const sellSignals = data.signals.signals.filter(s => s.Signal === 'SELL');
        
        // Convert signal prices to INR for US stocks
        const buyPrices = isUSStock ? buySignals.map(s => convertToINR(s.Price)) : buySignals.map(s => s.Price);
        const sellPrices = isUSStock ? sellSignals.map(s => convertToINR(s.Price)) : sellSignals.map(s => s.Price);

        // Main price chart with signals
        Plotly.newPlot('mainChart', [
            {
                x: dates,
                y: closes,
                type: 'line',
                name: 'Price',
                line: {color: '#4cc9f0', width: 2}
            },
            {
                x: buySignals.map(s => new Date(s.Date)),
                y: buyPrices,
                mode: 'markers',
                name: 'Buy',
                marker: {
                    color: '#4ade80',
                    size: 10,
                    symbol: 'triangle-up'
                }
            },
            {
                x: sellSignals.map(s => new Date(s.Date)),
                y: sellPrices,
                mode: 'markers',
                name: 'Sell',
                marker: {
                    color: '#f87171',
                    size: 10,
                    symbol: 'triangle-down'
                }
            }
        ], {
            title: `${currentTicker} Price with Buy/Sell Signals`,
            xaxis: {
                title: 'Date',
                color: '#e6e6e6',
                gridcolor: '#1a1a2e',
                zerolinecolor: '#1a1a2e'
            },
            yaxis: {
                title: 'Price (₹)',
                color: '#e6e6e6',
                gridcolor: '#1a1a2e',
                zerolinecolor: '#1a1a2e',
                tickformat: '₹,.2f'
            },
            plot_bgcolor: '#16213e',
            paper_bgcolor: '#16213e',
            font: {color: '#e6e6e6'},
            showlegend: true,
            legend: {
                x: 0,
                y: 1,
                bgcolor: '#0f3460',
                bordercolor: '#1a1a2e'
            },
            margin: {t: 50, r: 50, l: 50, b: 50},
            autosize: true,
            responsive: true
        });

        // SMA chart
        if (data.indicators?.SMA_20 && data.indicators?.SMA_50) {
            // Convert SMA indicators to INR for US stocks
            const sma20 = isUSStock ? data.indicators.SMA_20.map(price => convertToINR(price)) : data.indicators.SMA_20;
            const sma50 = isUSStock ? data.indicators.SMA_50.map(price => convertToINR(price)) : data.indicators.SMA_50;
            
            Plotly.newPlot('smaChart', [
                {
                    x: dates,
                    y: closes,
                    type: 'line',
                    name: 'Price',
                    line: {color: '#4cc9f0', width: 1.5}
                },
                {
                    x: dates,
                    y: sma20,
                    type: 'line',
                    name: 'SMA 20',
                    line: {color: '#f59e0b', width: 2}
                },
                {
                    x: dates,
                    y: sma50,
                    type: 'line',
                    name: 'SMA 50',
                    line: {color: '#8b5cf6', width: 2}
                }
            ], {
                title: 'Moving Averages',
                xaxis: {
                    color: '#e6e6e6',
                    gridcolor: '#1a1a2e',
                    zerolinecolor: '#1a1a2e'
                },
                yaxis: {
                    color: '#e6e6e6',
                    gridcolor: '#1a1a2e',
                    zerolinecolor: '#1a1a2e'
                },
                plot_bgcolor: '#16213e',
                paper_bgcolor: '#16213e',
                font: {color: '#e6e6e6'},
                showlegend: true,
                legend: {
                    x: 0,
                    y: 1,
                    bgcolor: '#0f3460',
                    bordercolor: '#1a1a2e'
                },
                margin: {t: 50, r: 20, l: 50, b: 30},
                autosize: true
            });
        }

        // RSI chart
        if (data.indicators?.RSI) {
            Plotly.newPlot('rsiChart', [{
                x: dates,
                y: data.indicators.RSI,
                type: 'line',
                name: 'RSI',
                line: {color: '#10b981', width: 2}
            }], {
                title: 'RSI (14)',
                shapes: [
                    {
                        type: 'line', 
                        y0: 30, y1: 30, 
                        x0: dates[0], x1: dates[dates.length-1], 
                        line: {color: '#4ade80', dash: 'dash', width: 1}
                    },
                    {
                        type: 'line', 
                        y0: 70, y1: 70, 
                        x0: dates[0], x1: dates[dates.length-1], 
                        line: {color: '#f87171', dash: 'dash', width: 1}
                    }
                ],
                plot_bgcolor: '#16213e',
                paper_bgcolor: '#16213e',
                font: {color: '#e6e6e6'},
                xaxis: {
                    color: '#e6e6e6',
                    gridcolor: '#1a1a2e',
                    zerolinecolor: '#1a1a2e'
                },
                yaxis: {
                    range: [0, 100],
                    color: '#e6e6e6',
                    gridcolor: '#1a1a2e',
                    zerolinecolor: '#1a1a2e'
                },
                margin: {t: 50, r: 20, l: 50, b: 30},
                autosize: true
            });
        }

        // Make charts responsive
        window.addEventListener('resize', function() {
            Plotly.Plots.resize('mainChart');
            Plotly.Plots.resize('smaChart');
            Plotly.Plots.resize('rsiChart');
        });
    } catch (error) {
        console.error('Error updating charts:', error);
        showAlert('Error rendering charts. Please try again.', 'danger');
    }
}

// Function to update recommendation based on signals
function updateRecommendation(signals) {
    const rec = signals.recommendation || 'HOLD';
    recommendationText.textContent = rec;
    recommendationBadge.textContent = rec;
    recommendationDate.textContent = signals.recommendation_date || 'N/A';
    
    // Set recommendation styling and explanation
    if (rec === 'BUY') {
        recommendationBadge.className = 'badge bg-success';
        signalExplanation.innerHTML = `
            <strong>BUY Recommendation:</strong> 
            <p>The trading algorithm detected favorable conditions based on:</p>
            <ul>
                <li>RSI below 30 (oversold condition) indicating potential reversal</li>
                <li>20-day SMA crossing above 50-day SMA (bullish trend signal)</li>
            </ul>
            <p class="mb-0">Consider accumulating positions at current levels.</p>
        `;
        signalExplanation.className = 'alert alert-success';
    } else if (rec === 'SELL') {
        recommendationBadge.className = 'badge bg-danger';
        signalExplanation.innerHTML = `
            <strong>SELL Recommendation:</strong> 
            <p>The trading algorithm detected unfavorable conditions based on:</p>
            <ul>
                <li>RSI above 70 (overbought condition) indicating potential pullback</li>
                <li>20-day SMA crossing below 50-day SMA (bearish trend signal)</li>
            </ul>
            <p class="mb-0">Consider taking profits or reducing exposure.</p>
        `;
        signalExplanation.className = 'alert alert-danger';
    } else {
        recommendationBadge.className = 'badge bg-secondary';
        signalExplanation.innerHTML = `
            <strong>HOLD Recommendation:</strong> 
            <p>The trading algorithm didn't detect strong enough signals for action.</p>
            <p>Current market conditions appear neutral. Maintain current positions.</p>
            <p class="mb-0">RSI is between oversold and overbought levels, and moving averages are not showing clear crossover signals.</p>
        `;
        signalExplanation.className = 'alert alert-secondary';
    }
}

// Function to update performance metrics
function updatePerformanceMetrics(analysis) {
    document.getElementById('totalTrades').textContent = analysis.total_trades || 0;
    document.getElementById('profitableTrades').textContent = analysis.profitable_trades || 0;
    document.getElementById('winRate').textContent = analysis.win_rate ? `${analysis.win_rate}%` : '0%';
    document.getElementById('totalProfit').textContent = analysis.total_profit ? formatPrice(analysis.total_profit) : formatPrice(0);
}

// Function to update recent trades table
function updateRecentTrades(positions) {
    tradesTableBody.innerHTML = '';
    
    if (!positions || positions.length === 0) {
        tradesTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No trades yet</td>
            </tr>
        `;
        return;
    }
    
    // Sort positions by date (newest first)
    const sortedPositions = [...positions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedPositions.forEach(trade => {
        const row = document.createElement('tr');
        const date = trade.date ? new Date(trade.date).toLocaleDateString() : 'N/A';
        const profit = trade.profit !== undefined ? trade.profit.toFixed(2) : '-';
        const profitClass = trade.profit > 0 ? 'text-success' : (trade.profit < 0 ? 'text-danger' : '');
        
        // Convert USD to INR for US stocks
        const isUSStock = stockDatabase.us.some(stock => stock.symbol === currentTicker);
        const tradePrice = isUSStock ? convertToINR(trade.price || 0) : (trade.price || 0);
        const tradeProfit = isUSStock && profit !== '-' ? convertToINR(trade.profit) : trade.profit;
        
        row.innerHTML = `
            <td>${date}</td>
            <td><span class="badge ${trade.type === 'BUY' ? 'bg-success' : 'bg-danger'}">${trade.type}</span></td>
            <td>${formatPrice(tradePrice)}</td>
            <td class="${profitClass}">${profit !== '-' ? formatPrice(tradeProfit) : profit}</td>
        `;
        tradesTableBody.appendChild(row);
    });
}

// Helper function to show loading state
function showLoading(show) {
    fetchBtn.disabled = show;
    fetchBtn.innerHTML = show 
        ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...' 
        : 'Analyze';
}

// Helper function to show error
function showError(message) {
    showAlert(message, 'danger', 5000);
}

// Helper function to show alerts
function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-floating');
    existingAlerts.forEach(alert => {
        if (alert.dataset.type === type) {
            alert.remove();
        }
    });
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-floating`;
    alertDiv.dataset.type = type;
    alertDiv.innerHTML = `
        ${type === 'danger' ? '<strong>Error:</strong> ' : ''}
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    document.body.appendChild(alertDiv);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }, duration);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Add floating alert styling
    const style = document.createElement('style');
    style.textContent = `
        .alert-floating {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1050;
            min-width: 250px;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
            animation: slideIn 0.3s ease-out forwards;
        }
        .alert-danger {
            border-left-color: #dc3545;
        }
        .alert-success {
            border-left-color: #198754;
        }
        .alert-warning {
            border-left-color: #ffc107;
        }
        .alert-info {
            border-left-color: #0dcaf0;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize with default ticker
    tickerInput.value = tickerInput.value || 'AAPL';
    currentTicker = tickerInput.value.trim().toUpperCase();
    fetchStockData();
});