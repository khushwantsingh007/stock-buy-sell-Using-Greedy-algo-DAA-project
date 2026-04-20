import numpy as np
import pandas as pd

class GreedyTradingAlgorithm:
    def __init__(self):
        self.buy_threshold = 30  # RSI below this is oversold (buy)
        self.sell_threshold = 70  # RSI above this is overbought (sell)
        self.sma_short = 20
        self.sma_long = 50

    def generate_signals(self, df):
        """Generate buy/sell signals based on technical indicators"""
        try:
            signals = pd.DataFrame(index=df.index)
            signals['Price'] = df['Close']
            signals['Signal'] = 'HOLD'
            
            # Greedy strategy 1: RSI-based
            signals.loc[df['RSI'] < self.buy_threshold, 'Signal'] = 'BUY'
            signals.loc[df['RSI'] > self.sell_threshold, 'Signal'] = 'SELL'
            
            # Greedy strategy 2: SMA crossover
            signals.loc[df['SMA_20'] > df['SMA_50'], 'Signal'] = 'BUY'
            signals.loc[df['SMA_20'] < df['SMA_50'], 'Signal'] = 'SELL'
            
            # Ensure signals have proper state management (not just scattered signals)
            # Start with no position
            positions = ['HOLD']
            
            for i in range(1, len(signals)):
                current_signal = signals.iloc[i]['Signal']
                prev_position = positions[-1]
                
                # Logic to prevent repeated buy/sell signals
                if current_signal == 'BUY' and prev_position == 'BUY':
                    positions.append('BUY')  # Continue holding
                elif current_signal == 'SELL' and prev_position == 'SELL':
                    positions.append('SELL')  # Continue holding
                elif current_signal == 'HOLD':
                    positions.append(prev_position)  # Maintain previous position
                else:
                    positions.append(current_signal)  # New signal - take it
            
            signals['Signal'] = positions
            
            return signals
        except Exception as e:
            print(f"Error generating signals: {str(e)}")
            return pd.DataFrame()  # Return empty DataFrame on error

    def analyze_performance(self, signals):
        """Calculate the performance metrics based on trading signals"""
        try:
            if signals is None or signals.empty:
                return self._empty_performance_result()
                
            positions = []
            current_position = None
            profit = 0
            
            for i in range(1, len(signals)):
                prev_signal = signals.iloc[i-1]['Signal']
                current_signal = signals.iloc[i]['Signal']
                price = signals.iloc[i]['Price']
                
                # Buy signal transition
                if prev_signal != 'BUY' and current_signal == 'BUY':
                    positions.append({
                        'type': 'BUY',
                        'date': signals.index[i],
                        'price': price
                    })
                    current_position = positions[-1]
                
                # Sell signal transition with open position
                elif prev_signal != 'SELL' and current_signal == 'SELL' and current_position is not None:
                    trade_profit = price - current_position['price']
                    profit += trade_profit
                    positions.append({
                        'type': 'SELL',
                        'date': signals.index[i],
                        'price': price,
                        'profit': trade_profit
                    })
                    current_position = None
            
            # Calculate win rate
            profit_trades = [p for p in positions if p.get('type') == 'SELL' and p.get('profit', 0) > 0]
            all_sell_trades = [p for p in positions if p.get('type') == 'SELL']
            
            win_rate = 0
            if all_sell_trades:
                win_rate = len(profit_trades) / len(all_sell_trades)
            
            return {
                'total_trades': len(all_sell_trades),
                'profitable_trades': len(profit_trades),
                'win_rate': round(win_rate * 100, 2),
                'total_profit': round(profit, 2),
                'positions': positions[-5:] if positions else []  # Show last 5 positions
            }
        except Exception as e:
            print(f"Error analyzing performance: {str(e)}")
            return self._empty_performance_result()
    
    def _empty_performance_result(self):
        """Return empty performance metrics structure"""
        return {
            'total_trades': 0,
            'profitable_trades': 0,
            'win_rate': 0,
            'total_profit': 0,
            'positions': []
        }