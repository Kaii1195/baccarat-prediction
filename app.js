// ==========================================
// BACCARAT PREDICTION SYSTEM
// Multiple Statistical Methods
// ==========================================

// Global Variables
// ===== SOUND EFFECTS =====
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const now = audioContext.currentTime;
    
    // Âm "click" giống iPhone keyboard - ngắn, sắc, chuyên nghiệp
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Tần số khác nhau cho mỗi button
    const frequencies = {
        banker: 1200,  // Click sắc cao
        player: 1000,  // Click trung bình
        tie: 800       // Click trầm hơn
    };
    
    oscillator.frequency.value = frequencies[type] || 1000;
    oscillator.type = 'sine';
    
    // High-pass filter để âm sắc, rõ ràng
    filter.type = 'highpass';
    filter.frequency.value = 500;
    filter.Q.value = 1;
    
    // Envelope cực ngắn - đặc trưng của click iPhone
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04); // Rất ngắn: 40ms
    
    oscillator.start(now);
    oscillator.stop(now + 0.05);
    
    // Thêm tiếng "tick" nhỏ để phong phú hơn
    addClickTick(now + 0.005);
}

function addClickTick(startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 3000; // Tần số cao cho "tick"
    oscillator.type = 'square'; // Sóng vuông cho âm sắc
    
    gainNode.gain.setValueAtTime(0.15, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.015);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.02);
}

function playBeep(frequency, duration, startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope: Quick attack, smooth release
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function playChord(frequencies, duration, startTime) {
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'triangle'; // Soft bell-like sound
        
        // Staggered attack for bell effect
        const attackTime = startTime + (index * 0.02);
        gainNode.gain.setValueAtTime(0, attackTime);
        gainNode.gain.linearRampToValueAtTime(0.2, attackTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, attackTime + duration);
        
        oscillator.start(attackTime);
        oscillator.stop(attackTime + duration);
    });
}

// ===== EXISTING CODE =====
let gameHistory = [];
let predictions = {};
let accuracyStats = {
    total: 0,
    correct: 0,
    currentStreak: 0, // Positive = winning, negative = losing
    maxLossStreak: 0,
    streakHistory: [] // Track for analysis
};

// Shoe tracking
let currentShoe = 1;
let currentHand = 0;
let shoeHistory = []; // Array of shoes: [{shoeNumber, hands: [...]}]
const MAX_HANDS_PER_SHOE = 80; // Typical max hands per shoe
const WARNING_THRESHOLD = 60; // Warn when approaching end of shoe

// Money Management
let moneyConfig = {
    capital: 1000000,
    baseBet: 10000,
    targetProfit: 100000,
    signalAfter: 3
};
let moneyState = {
    currentCapital: 1000000,
    profitLoss: 0,
    consecutiveLosses: 0,
    currentBet: 10000,
    totalBets: 0,
    wins: 0,
    losses: 0
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeShoe();
    updateDisplay();
});

// ==========================================
// SHOE MANAGEMENT
// ==========================================

function initializeShoe() {
    if (shoeHistory.length === 0) {
        shoeHistory.push({
            shoeNumber: currentShoe,
            hands: []
        });
    }
}

function resetShoe() {
    if (currentHand === 0) {
        alert('Shoe hiện tại chưa có dữ liệu!');
        return;
    }
    
    if (confirm(`Bắt đầu Shoe mới? (Shoe hiện tại: #${currentShoe} có ${currentHand} phiên)`)) {
        currentShoe++;
        currentHand = 0;
        gameHistory = [];
        predictions = {};
        
        // Create new shoe entry
        shoeHistory.push({
            shoeNumber: currentShoe,
            hands: []
        });
        
        saveToStorage();
        updateDisplay();
        showNotification(`🎴 Bắt đầu Shoe #${currentShoe}`);
    }
}

function getCurrentShoeData() {
    return shoeHistory[shoeHistory.length - 1];
}

function checkShoeWarning() {
    if (currentHand >= WARNING_THRESHOLD && currentHand < MAX_HANDS_PER_SHOE) {
        return `⚠️ Gần hết shoe (${currentHand}/${MAX_HANDS_PER_SHOE})`;
    } else if (currentHand >= MAX_HANDS_PER_SHOE) {
        return `🔴 Vượt quá giới hạn shoe! Nên reset.`;
    }
    return null;
}

// ==========================================
// CORE FUNCTIONS
// ==========================================

function addResult(result, skipUpdate = false) {
    if (!['B', 'P', 'T'].includes(result)) {
        alert('Kết quả không hợp lệ!');
        return;
    }
    
    // Check if shoe limit reached (skip if batch import)
    if (!skipUpdate && currentHand >= MAX_HANDS_PER_SHOE) {
        if (!confirm(`Đã đạt ${MAX_HANDS_PER_SHOE} phiên! Bạn có muốn tiếp tục thêm vào shoe này?`)) {
            return;
        }
    }
    
    // Check prediction accuracy BEFORE adding new result (skip if batch import)
    // Need at least 3 results to have a prediction
    if (!skipUpdate && gameHistory.length >= 3 && predictions.composite && predictions.composite.result) {
        checkPredictionAccuracy(result);
    }
    
    gameHistory.push(result);
    currentHand++;
    
    // Update current shoe data
    const currentShoeData = getCurrentShoeData();
    currentShoeData.hands.push(result);
    
    // Only save and update if not batch importing
    if (!skipUpdate) {
        saveToStorage();
        updateDisplay();
    }
    
    // Check for warnings
    const warning = checkShoeWarning();
    if (warning) {
        showNotification(warning);
    } else {
        showNotification(`Đã thêm: ${getResultName(result)} (Phiên ${currentHand})`);
    }
}

function undoLast() {
    if (gameHistory.length === 0) {
        alert('Không có dữ liệu để hoàn tác!');
        return;
    }
    
    const removed = gameHistory.pop();
    currentHand--;
    
    // Update current shoe data
    const currentShoeData = getCurrentShoeData();
    currentShoeData.hands.pop();
    
    saveToStorage();
    updateDisplay();
    showNotification(`Đã xóa: ${getResultName(removed)}`);
}

function clearAll() {
    if (gameHistory.length === 0) {
        alert('Chưa có dữ liệu!');
        return;
    }
    
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu (bao gồm lịch sử các shoe)?')) {
        gameHistory = [];
        predictions = {};
        accuracyStats = { 
            total: 0, 
            correct: 0,
            currentStreak: 0,
            maxLossStreak: 0,
            streakHistory: []
        };
        currentShoe = 1;
        currentHand = 0;
        shoeHistory = [{
            shoeNumber: 1,
            hands: []
        }];
        
        saveToStorage();
        
        // Force clear all displays immediately AFTER saving
        const historyDiv = document.getElementById('history-display');
        if (historyDiv) {
            historyDiv.innerHTML = '<p class="empty-message">Chưa có dữ liệu. Nhấn nút phía trên để thêm kết quả.</p>';
        }
        
        const predComposite = document.getElementById('pred-composite');
        if (predComposite) {
            predComposite.innerHTML = '<span class="pred-label">Chờ dữ liệu...</span>';
            predComposite.className = 'prediction-result-hero waiting';
        }
        
        const confidenceEl = document.getElementById('confidence-text');
        if (confidenceEl) {
            confidenceEl.textContent = '';
        }
        
        // Force clear Prediction Stats (Hiệu Suất Dự Đoán)
        const winrateEl = document.getElementById('prediction-winrate');
        if (winrateEl) winrateEl.textContent = '0%';
        
        const streakEl = document.getElementById('prediction-streak');
        if (streakEl) streakEl.textContent = '0';
        
        const streakIconEl = document.getElementById('streak-icon');
        if (streakIconEl) streakIconEl.textContent = '⚪';
        
        const maxLossEl = document.getElementById('max-loss-streak');
        if (maxLossEl) maxLossEl.textContent = '0';
        
        const correctEl = document.getElementById('prediction-correct');
        if (correctEl) correctEl.textContent = '0';
        
        const wrongEl = document.getElementById('prediction-wrong');
        if (wrongEl) wrongEl.textContent = '0';
        
        const totalEl = document.getElementById('prediction-total');
        if (totalEl) totalEl.textContent = '0';
        
        // Force clear statistics
        document.getElementById('banker-count').textContent = '0';
        document.getElementById('player-count').textContent = '0';
        document.getElementById('tie-count').textContent = '0';
        document.getElementById('total-count').textContent = '0';
        document.getElementById('banker-percent').textContent = '0%';
        document.getElementById('player-percent').textContent = '0%';
        document.getElementById('tie-percent').textContent = '0%';
        const totalPercentEl = document.getElementById('total-percent');
        if (totalPercentEl) totalPercentEl.textContent = '0%';
        
        // Force clear shoe info
        const shoeInfoEl = document.getElementById('shoe-info');
        if (shoeInfoEl) shoeInfoEl.textContent = 'Shoe #1';
        const handCountEl = document.getElementById('hand-count');
        if (handCountEl) handCountEl.textContent = '0/80 phiên';
        
        // Force clear current streak
        const currentStreakEl = document.getElementById('current-streak');
        if (currentStreakEl) currentStreakEl.textContent = 'N/A';
        const longestStreakInlineEl = document.getElementById('longest-streak-inline');
        if (longestStreakInlineEl) longestStreakInlineEl.textContent = 'Max: N/A';
        
        showNotification('Đã xóa tất cả dữ liệu');
    }
}

function getResultName(result) {
    const names = {
        'B': 'Banker',
        'P': 'Player',
        'T': 'Tie'
    };
    return names[result] || result;
}

// ==========================================
// DISPLAY FUNCTIONS
// ==========================================

function updateDisplay() {
    updateStatistics();
    updateShoeInfo();
    updateHistory();
    updatePredictions();
    updateAdvancedStats();
    updateMoneyDisplay();
    updatePredictionStats();
}

function updateStatistics() {
    const counts = {
        B: gameHistory.filter(r => r === 'B').length,
        P: gameHistory.filter(r => r === 'P').length,
        T: gameHistory.filter(r => r === 'T').length
    };
    
    const total = gameHistory.length;
    
    document.getElementById('banker-count').textContent = counts.B;
    document.getElementById('player-count').textContent = counts.P;
    document.getElementById('tie-count').textContent = counts.T;
    document.getElementById('total-count').textContent = total;
    
    if (total > 0) {
        document.getElementById('banker-percent').textContent = 
            `${((counts.B / total) * 100).toFixed(1)}%`;
        document.getElementById('player-percent').textContent = 
            `${((counts.P / total) * 100).toFixed(1)}%`;
        document.getElementById('tie-percent').textContent = 
            `${((counts.T / total) * 100).toFixed(1)}%`;
        
        // Update total percent (always 100% when there's data)
        const totalPercentEl = document.getElementById('total-percent');
        if (totalPercentEl) {
            totalPercentEl.textContent = '100%';
        }
    } else {
        document.getElementById('banker-percent').textContent = '0%';
        document.getElementById('player-percent').textContent = '0%';
        document.getElementById('tie-percent').textContent = '0%';
        
        const totalPercentEl = document.getElementById('total-percent');
        if (totalPercentEl) {
            totalPercentEl.textContent = '0%';
        }
    }
}

function updateShoeInfo() {
    const shoeInfoEl = document.getElementById('shoe-info');
    const handCountEl = document.getElementById('hand-count');
    
    if (shoeInfoEl) {
        shoeInfoEl.textContent = `Shoe #${currentShoe}`;
        
        // Add warning color if needed
        if (currentHand >= MAX_HANDS_PER_SHOE) {
            shoeInfoEl.style.color = '#e74c3c';
        } else if (currentHand >= WARNING_THRESHOLD) {
            shoeInfoEl.style.color = '#f39c12';
        } else {
            shoeInfoEl.style.color = '';
        }
    }
    
    if (handCountEl) {
        handCountEl.textContent = `${currentHand}/${MAX_HANDS_PER_SHOE} phiên`;
    }
    
    // Update progress bar if exists
    const progressEl = document.getElementById('shoe-progress');
    if (progressEl) {
        const percentage = Math.min((currentHand / MAX_HANDS_PER_SHOE) * 100, 100);
        progressEl.style.width = `${percentage}%`;
        
        if (percentage >= 100) {
            progressEl.style.background = '#e74c3c';
        } else if (percentage >= 75) {
            progressEl.style.background = '#f39c12';
        } else {
            progressEl.style.background = '#3498db';
        }
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('history-display');
    
    if (gameHistory.length === 0) {
        historyDiv.innerHTML = '<p class="empty-message">Chưa có dữ liệu. Nhấn nút phía trên để thêm kết quả.</p>';
        document.getElementById('current-streak').textContent = 'N/A';
        return;
    }
    
    historyDiv.innerHTML = '';
    gameHistory.forEach((result, index) => {
        const item = document.createElement('div');
        // Map result to class name
        const className = result === 'B' ? 'banker' : result === 'P' ? 'player' : 'tie';
        item.className = `history-item ${className}`;
        item.textContent = result; // Display B, P, or T
        
        // Don't add tooltip to prevent $ showing
        // const tooltip = document.createElement('span');
        // tooltip.className = 'tooltip';
        // tooltip.textContent = `#${index + 1}`;
        // item.appendChild(tooltip);
        
        historyDiv.appendChild(item);
    });
    
    // Update current streak
    const streak = getCurrentStreak();
    const currentStreakEl = document.getElementById('current-streak');
    if (currentStreakEl) {
        currentStreakEl.textContent = streak;
        console.log('✅ Updated current streak:', streak);
    } else {
        console.error('❌ Element #current-streak not found!');
    }
}

function updatePredictions() {
    if (gameHistory.length < 3) {
        resetPredictions();
        return;
    }
    
    // Calculate all predictions
    predictions = {
        frequency: predictByFrequency(),
        pattern: predictByPattern(),
        streak: predictByStreak(),
        markov: predictByMarkov(),
        hotcold: predictByHotCold()
    };
    
    // Composite prediction (weighted average)
    predictions.composite = calculateComposite();
    
    // Display predictions
    displayPrediction('pred-frequency', predictions.frequency);
    displayPrediction('pred-pattern', predictions.pattern);
    displayPrediction('pred-streak', predictions.streak);
    displayPrediction('pred-markov', predictions.markov);
    displayPrediction('pred-hotcold', predictions.hotcold);
    displayPrediction('pred-composite', predictions.composite);
}

function displayPrediction(elementId, prediction) {
    const element = document.getElementById(elementId);
    
    if (!element) return;
    
    if (!prediction || !prediction.result) {
        element.innerHTML = '<span class="pred-label">Chưa đủ dữ liệu</span>';
        element.className = element.className.replace(/\b(banker|player|tie|waiting)\b/g, '').trim();
        element.classList.add('waiting');
        return;
    }
    
    const confidence = (prediction.confidence * 100).toFixed(1);
    const confidenceNum = parseFloat(confidence);
    const resultName = getResultName(prediction.result);
    
    // Remove all prediction-related classes first
    element.className = element.className.replace(/\b(b|p|t|banker|player|tie|waiting)\b/gi, '').trim();
    
    // For large prediction box
    if (elementId === 'pred-composite') {
        const MIN_CONFIDENCE = 60; // Chỉ hiện khi >60%
        
        if (confidenceNum < MIN_CONFIDENCE) {
            // Không đủ confidence -> chờ signal tốt hơn
            element.classList.add('waiting');
            element.innerHTML = `
                <span class="pred-label">Chờ tín hiệu tốt hơn...</span>
            `;
            
            const confidenceEl = document.getElementById('confidence-text');
            if (confidenceEl) {
                confidenceEl.textContent = `Độ tin cậy: ${confidence}%`;
                confidenceEl.style.color = '#95a5a6';
            }
        } else {
            // Đủ confidence -> show prediction
            element.classList.add(prediction.result.toLowerCase());
            element.innerHTML = `
                <span class="pred-label">${resultName}</span>
            `;
            
            const confidenceEl = document.getElementById('confidence-text');
            if (confidenceEl) {
                confidenceEl.textContent = `✅ Tỷ lệ thắng: ${confidence}% `;
                confidenceEl.style.color = '#2ecc71';
                confidenceEl.style.fontWeight = 'bold';
            }
            
        }
    } else {
        // For regular prediction cards (if any)
        element.classList.add(prediction.result.toLowerCase());
        element.innerHTML = `
            <span class="pred-label pred-${prediction.result}">${resultName}</span>
            <span class="pred-confidence">Độ tin cậy: ${confidence}%</span>
        `;
    }
}

function resetPredictions() {
    const predIds = ['pred-frequency', 'pred-pattern', 'pred-streak', 'pred-markov', 'pred-hotcold', 'pred-composite'];
    predIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<span class="pred-label">Chờ dữ liệu...</span>';
            // Remove all prediction classes
            element.className = element.className.replace(/\b(b|p|t|banker|player|tie|waiting)\b/gi, '').trim();
            element.classList.add('waiting');
        }
    });
    
    // Reset confidence display
    const confidenceEl = document.getElementById('confidence-text');
    if (confidenceEl) {
        confidenceEl.textContent = '';
    }
}

function updateAdvancedStats() {
    // Longest streak
    const longestStreak = getLongestStreak();
    const longestStreakEl = document.getElementById('longest-streak');
    const longestStreakInlineEl = document.getElementById('longest-streak-inline');
    if (longestStreakEl) longestStreakEl.textContent = longestStreak;
    if (longestStreakInlineEl) {
        longestStreakInlineEl.textContent = `Max: ${longestStreak}`;
        console.log('✅ Updated longest streak:', longestStreak);
    }
    
    // Common pattern
    const commonPattern = getMostCommonPattern();
    const commonPatternEl = document.getElementById('common-pattern');
    if (commonPatternEl) commonPatternEl.textContent = commonPattern;
    
    // B/P Ratio
    const ratio = getBPRatio();
    const ratioEl = document.getElementById('bp-ratio');
    if (ratioEl) ratioEl.textContent = ratio;
    
    // Accuracy
    const accuracy = getAccuracy();
    const accuracyEl = document.getElementById('accuracy');
    if (accuracyEl) accuracyEl.textContent = accuracy;
    
    // Shoe statistics
    updateShoeStats();
}

function updatePredictionStats() {
    // Win Rate
    const winrateEl = document.getElementById('prediction-winrate');
    if (winrateEl) {
        if (accuracyStats.total === 0) {
            winrateEl.textContent = '0%';
        } else {
            const percentage = ((accuracyStats.correct / accuracyStats.total) * 100).toFixed(1);
            winrateEl.textContent = `${percentage}%`;
        }
    }
    
    // Current Streak
    const streakEl = document.getElementById('prediction-streak');
    const streakIconEl = document.getElementById('streak-icon');
    
    if (streakEl) {
        const streak = accuracyStats.currentStreak;
        
        if (streak === 0 || accuracyStats.total === 0) {
            streakEl.textContent = '0';
            if (streakIconEl) streakIconEl.textContent = '⚪';
        } else if (streak > 0) {
            streakEl.textContent = `${streak} 🔥`;
            if (streakIconEl) streakIconEl.textContent = '🔥';
        } else {
            streakEl.textContent = `${Math.abs(streak)} ❄️`;
            if (streakIconEl) streakIconEl.textContent = '❄️';
        }
    }
    
    // Max Loss Streak
    const maxLossStreakEl = document.getElementById('max-loss-streak');
    if (maxLossStreakEl) {
        maxLossStreakEl.textContent = accuracyStats.maxLossStreak;
    }
    
    // Totals
    const correctEl = document.getElementById('prediction-correct');
    const wrongEl = document.getElementById('prediction-wrong');
    const totalEl = document.getElementById('prediction-total');
    
    const wrongCount = accuracyStats.total - accuracyStats.correct;
    
    if (correctEl) correctEl.textContent = accuracyStats.correct;
    if (wrongEl) wrongEl.textContent = wrongCount;
    if (totalEl) totalEl.textContent = accuracyStats.total;
}

function updateShoeStats() {
    const shoeStatsEl = document.getElementById('shoe-stats');
    if (!shoeStatsEl) return;
    
    if (shoeHistory.length === 1 && currentHand === 0) {
        shoeStatsEl.innerHTML = '<p class="empty-message">Chưa có dữ liệu shoe</p>';
        return;
    }
    
    let html = '<div class="shoe-stats-list">';
    
    // Show last 5 shoes
    const recentShoes = shoeHistory.slice(-5).reverse();
    
    recentShoes.forEach(shoe => {
        const hands = shoe.hands;
        const total = hands.length;
        
        if (total === 0 && shoe.shoeNumber === currentShoe) {
            html += `<div class="shoe-stat-item current">
                <strong>Shoe #${shoe.shoeNumber}</strong> (Đang chơi)
                <span>0 phiên</span>
            </div>`;
            return;
        }
        
        if (total === 0) return;
        
        const bCount = hands.filter(r => r === 'B').length;
        const pCount = hands.filter(r => r === 'P').length;
        const tCount = hands.filter(r => r === 'T').length;
        
        const bPercent = ((bCount / total) * 100).toFixed(1);
        const pPercent = ((pCount / total) * 100).toFixed(1);
        
        const isCurrent = shoe.shoeNumber === currentShoe ? 'current' : '';
        
        html += `<div class="shoe-stat-item ${isCurrent}">
            <strong>Shoe #${shoe.shoeNumber}</strong>
            ${isCurrent ? '(Đang chơi)' : ''}
            <div class="shoe-mini-stats">
                <span>🔵 ${bCount} (${bPercent}%)</span>
                <span>🔴 ${pCount} (${pPercent}%)</span>
                <span>🟢 ${tCount}</span>
                <span>Total: ${total}</span>
            </div>
        </div>`;
    });
    
    html += '</div>';
    shoeStatsEl.innerHTML = html;
}

// ==========================================
// PREDICTION METHODS
// ==========================================

// 1. Frequency-based prediction
function predictByFrequency() {
    const counts = {
        B: gameHistory.filter(r => r === 'B').length,
        P: gameHistory.filter(r => r === 'P').length,
        T: gameHistory.filter(r => r === 'T').length
    };
    
    const total = gameHistory.length;
    const probabilities = {
        B: counts.B / total,
        P: counts.P / total,
        T: counts.T / total
    };
    
    const result = Object.keys(probabilities).reduce((a, b) => 
        probabilities[a] > probabilities[b] ? a : b
    );
    
    return {
        result: result,
        confidence: probabilities[result]
    };
}

// 2. Pattern recognition
function predictByPattern() {
    if (gameHistory.length < 4) return null;
    
    const patternLength = 3;
    const lastPattern = gameHistory.slice(-patternLength).join('');
    
    // Find all occurrences of this pattern
    const matches = [];
    for (let i = 0; i <= gameHistory.length - patternLength - 1; i++) {
        const pattern = gameHistory.slice(i, i + patternLength).join('');
        if (pattern === lastPattern && i + patternLength < gameHistory.length) {
            matches.push(gameHistory[i + patternLength]);
        }
    }
    
    if (matches.length === 0) {
        return predictByFrequency(); // Fallback
    }
    
    // Count what came after this pattern
    const counts = { B: 0, P: 0, T: 0 };
    matches.forEach(m => counts[m]++);
    
    const result = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
    );
    
    return {
        result: result,
        confidence: counts[result] / matches.length
    };
}

// 3. Streak analysis
function predictByStreak() {
    if (gameHistory.length < 2) return null;
    
    const lastResult = gameHistory[gameHistory.length - 1];
    let streakLength = 1;
    
    for (let i = gameHistory.length - 2; i >= 0; i--) {
        if (gameHistory[i] === lastResult) {
            streakLength++;
        } else {
            break;
        }
    }
    
    // If streak is long (>= 3), predict it will break
    // If streak is short, predict it will continue
    if (streakLength >= 3) {
        // Predict opposite
        const opposite = lastResult === 'B' ? 'P' : 'B';
        return {
            result: opposite,
            confidence: 0.6 + (streakLength * 0.05)
        };
    } else {
        // Predict continuation
        return {
            result: lastResult,
            confidence: 0.55
        };
    }
}

// 4. Markov Chain prediction
function predictByMarkov() {
    if (gameHistory.length < 5) return null;
    
    // Build transition matrix
    const transitions = {
        'B': { B: 0, P: 0, T: 0 },
        'P': { B: 0, P: 0, T: 0 },
        'T': { B: 0, P: 0, T: 0 }
    };
    
    for (let i = 0; i < gameHistory.length - 1; i++) {
        const current = gameHistory[i];
        const next = gameHistory[i + 1];
        transitions[current][next]++;
    }
    
    // Get last result
    const lastResult = gameHistory[gameHistory.length - 1];
    const lastTransitions = transitions[lastResult];
    
    const total = lastTransitions.B + lastTransitions.P + lastTransitions.T;
    if (total === 0) return predictByFrequency();
    
    const probabilities = {
        B: lastTransitions.B / total,
        P: lastTransitions.P / total,
        T: lastTransitions.T / total
    };
    
    const result = Object.keys(probabilities).reduce((a, b) => 
        probabilities[a] > probabilities[b] ? a : b
    );
    
    return {
        result: result,
        confidence: probabilities[result]
    };
}

// 5. Hot/Cold analysis
function predictByHotCold() {
    if (gameHistory.length < 10) return null;
    
    const recentGames = 10;
    const recent = gameHistory.slice(-recentGames);
    
    const counts = {
        B: recent.filter(r => r === 'B').length,
        P: recent.filter(r => r === 'P').length,
        T: recent.filter(r => r === 'T').length
    };
    
    // Predict the "hot" result
    const result = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
    );
    
    return {
        result: result,
        confidence: counts[result] / recentGames
    };
}

// 6. Composite prediction (combine all methods)
function calculateComposite() {
    const methods = ['frequency', 'pattern', 'streak', 'markov', 'hotcold'];
    const votes = { B: 0, P: 0, T: 0 };
    const weights = { B: 0, P: 0, T: 0 };
    
    methods.forEach(method => {
        if (predictions[method] && predictions[method].result) {
            const pred = predictions[method];
            votes[pred.result]++;
            weights[pred.result] += pred.confidence;
        }
    });
    
    // Find result with highest weighted vote
    let bestResult = 'B';
    let bestScore = 0;
    
    ['B', 'P', 'T'].forEach(r => {
        const score = votes[r] * weights[r];
        if (score > bestScore) {
            bestScore = score;
            bestResult = r;
        }
    });
    
    const totalVotes = votes.B + votes.P + votes.T;
    const confidence = totalVotes > 0 ? (weights[bestResult] / votes[bestResult]) : 0;
    
    return {
        result: bestResult,
        confidence: Math.min(confidence, 0.95) // Cap at 95%
    };
}

// ==========================================
// STATISTICS HELPERS
// ==========================================

function getCurrentStreak() {
    if (gameHistory.length === 0) return 'N/A';
    
    const lastResult = gameHistory[gameHistory.length - 1];
    let count = 1;
    
    for (let i = gameHistory.length - 2; i >= 0; i--) {
        if (gameHistory[i] === lastResult) {
            count++;
        } else {
            break;
        }
    }
    
    return `${count}x ${getResultName(lastResult)}`;
}

function getLongestStreak() {
    if (gameHistory.length === 0) return 'N/A';
    
    let maxStreak = 1;
    let maxResult = gameHistory[0];
    let currentStreak = 1;
    let currentResult = gameHistory[0];
    
    for (let i = 1; i < gameHistory.length; i++) {
        if (gameHistory[i] === currentResult) {
            currentStreak++;
        } else {
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
                maxResult = currentResult;
            }
            currentStreak = 1;
            currentResult = gameHistory[i];
        }
    }
    
    if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        maxResult = currentResult;
    }
    
    return `${maxStreak}x ${maxResult}`;
}

function getMostCommonPattern() {
    if (gameHistory.length < 3) return 'N/A';
    
    const patterns = {};
    const patternLength = 3;
    
    for (let i = 0; i <= gameHistory.length - patternLength; i++) {
        const pattern = gameHistory.slice(i, i + patternLength).join('');
        patterns[pattern] = (patterns[pattern] || 0) + 1;
    }
    
    let maxPattern = '';
    let maxCount = 0;
    
    for (const [pattern, count] of Object.entries(patterns)) {
        if (count > maxCount) {
            maxCount = count;
            maxPattern = pattern;
        }
    }
    
    return `${maxPattern} (${maxCount}x)`;
}

function getBPRatio() {
    const bCount = gameHistory.filter(r => r === 'B').length;
    const pCount = gameHistory.filter(r => r === 'P').length;
    
    if (pCount === 0) return bCount > 0 ? '∞' : 'N/A';
    
    const ratio = (bCount / pCount).toFixed(2);
    return `${ratio}:1`;
}

function getAccuracy() {
    if (accuracyStats.total === 0) return 'N/A';
    
    const percentage = ((accuracyStats.correct / accuracyStats.total) * 100).toFixed(1);
    return `${percentage}% (${accuracyStats.correct}/${accuracyStats.total})`;
}

// ==========================================
// PREDICTION VERIFICATION (AUTO)
// ==========================================

function checkPredictionAccuracy(actualResult) {
    if (predictions.composite && predictions.composite.result) {
        const predictedResult = predictions.composite.result;
        const predictedName = getResultName(predictedResult);
        const actualName = getResultName(actualResult);
        
        console.log('🔍 Checking prediction:', {
            predicted: predictedResult,
            actual: actualResult,
            isMatch: predictedResult === actualResult
        });
        
        accuracyStats.total++;
        const isCorrect = predictedResult === actualResult;
        
        if (isCorrect) {
            accuracyStats.correct++;
            // Update streak - winning
            if (accuracyStats.currentStreak < 0) {
                accuracyStats.currentStreak = 1; // Reset from losing to winning
            } else {
                accuracyStats.currentStreak++;
            }
            // Show success notification
            showNotification(`✅ Dự đoán đúng: ${predictedName} = ${actualName}`);
        } else {
            // Update streak - losing
            if (accuracyStats.currentStreak > 0) {
                accuracyStats.currentStreak = -1; // Reset from winning to losing
            } else {
                accuracyStats.currentStreak--;
            }
            
            // Track max loss streak
            const currentLossStreak = Math.abs(accuracyStats.currentStreak);
            if (currentLossStreak > accuracyStats.maxLossStreak) {
                accuracyStats.maxLossStreak = currentLossStreak;
            }
            // Show fail notification
            showNotification(`❌ Dự đoán sai: ${predictedName} ≠ ${actualName}`);
        }
        
        accuracyStats.streakHistory.push({
            result: isCorrect ? 'W' : 'L',
            predicted: predictedResult,
            actual: actualResult,
            timestamp: Date.now()
        });
        
        // Keep only last 50 predictions
        if (accuracyStats.streakHistory.length > 50) {
            accuracyStats.streakHistory.shift();
        }
        
        saveToStorage();
        
        // Force update prediction stats display
        setTimeout(() => {
            updatePredictionStats();
        }, 100);
    }
}

// ==========================================
// STORAGE FUNCTIONS
// ==========================================

function saveToStorage() {
    const data = {
        history: gameHistory,
        accuracy: accuracyStats,
        currentShoe: currentShoe,
        currentHand: currentHand,
        shoeHistory: shoeHistory
    };
    localStorage.setItem('baccaratPrediction', JSON.stringify(data));
}

function loadFromStorage() {
    const saved = localStorage.getItem('baccaratPrediction');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameHistory = data.history || [];
            accuracyStats = data.accuracy || { 
                total: 0, 
                correct: 0,
                currentStreak: 0,
                maxLossStreak: 0,
                streakHistory: []
            };
            // Ensure new fields exist for old data
            if (!accuracyStats.currentStreak) accuracyStats.currentStreak = 0;
            if (!accuracyStats.maxLossStreak) accuracyStats.maxLossStreak = 0;
            if (!accuracyStats.streakHistory) accuracyStats.streakHistory = [];
            
            currentShoe = data.currentShoe || 1;
            currentHand = data.currentHand || 0;
            shoeHistory = data.shoeHistory || [{shoeNumber: 1, hands: []}];
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

// ==========================================
// IMPORT/EXPORT FUNCTIONS
// ==========================================

function exportData() {
    if (gameHistory.length === 0 && shoeHistory.every(s => s.hands.length === 0)) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const data = {
        history: gameHistory,
        accuracy: accuracyStats,
        currentShoe: currentShoe,
        currentHand: currentHand,
        shoeHistory: shoeHistory,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `baccarat-shoe${currentShoe}-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Đã xuất dữ liệu thành công!');
}

function importData() {
    document.getElementById('fileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.history && Array.isArray(data.history)) {
                if (confirm('Import sẽ thay thế dữ liệu hiện tại. Tiếp tục?')) {
                    gameHistory = data.history;
                    accuracyStats = data.accuracy || { total: 0, correct: 0 };
                    currentShoe = data.currentShoe || 1;
                    currentHand = data.currentHand || gameHistory.length;
                    shoeHistory = data.shoeHistory || [{shoeNumber: currentShoe, hands: gameHistory}];
                    saveToStorage();
                    updateDisplay();
                    showNotification('Import thành công!');
                }
            } else {
                alert('File không đúng định dạng!');
            }
        } catch (err) {
            alert('Lỗi đọc file: ' + err.message);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// ==========================================
// UI HELPERS
// ==========================================

function showNotification(message) {
    // Simple notification - can be enhanced with a toast library
    console.log('📢', message);
}

// ==========================================
// IMAGE PROCESSING & AI DETECTION
// ==========================================

// Initialize paste area on page load
document.addEventListener('DOMContentLoaded', () => {
    const pasteArea = document.getElementById('pasteArea');
    
    if (pasteArea) {
        // Paste event
        pasteArea.addEventListener('paste', handlePaste);
        
        // Drag and drop events
        pasteArea.addEventListener('dragover', handleDragOver);
        pasteArea.addEventListener('dragleave', handleDragLeave);
        pasteArea.addEventListener('drop', handleDrop);
        
        // Click to focus
        pasteArea.addEventListener('click', () => {
            pasteArea.focus();
        });
    }
});

function handlePaste(e) {
    e.preventDefault();
    
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            loadImageFromBlob(blob);
            return;
        }
    }
    
    showNotification('❌ Không tìm thấy ảnh trong clipboard. Hãy chụp màn hình trước!');
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.indexOf('image') !== -1) {
        loadImageFromBlob(files[0]);
    } else {
        showNotification('❌ Vui lòng kéo thả file ảnh!');
    }
}

function loadImageFromBlob(blob) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            displayImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(blob);
}

function processImageFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    loadImageFromBlob(file);
}

function displayImage(img) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const placeholder = document.getElementById('pastePlaceholder');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const status = document.getElementById('detectionStatus');
    
    // Hide placeholder
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    analyzeBtn.style.display = 'block';
    status.style.display = 'block';
    
    // Set canvas size
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    status.className = 'detection-status';
    status.textContent = '✅ Ảnh đã tải. Click "🔍 Phân Tích Ảnh" để bắt đầu!';
    
    showNotification('📸 Ảnh đã được tải lên!');
}

function analyzeImage() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const status = document.getElementById('detectionStatus');
    
    if (!canvas.width || !canvas.height) {
        showNotification('❌ Chưa có ảnh để phân tích!');
        return;
    }
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Analyze
    status.className = 'detection-status';
    status.textContent = '🔍 Đang phân tích màu sắc...';
    
    setTimeout(() => {
        try {
            const results = analyzeRoadmap(imageData, canvas.width, canvas.height);
            
            if (results.length > 0) {
                status.className = 'detection-status success';
                status.textContent = `✅ Phát hiện ${results.length} kết quả: ${results.join('')}`;
                
                // Ask user to import
                if (confirm(`Tìm thấy ${results.length} kết quả:\n\n${results.join(' ')}\n\nNhập vào hệ thống?`)) {
                    // Clear current data if needed
                    if (gameHistory.length > 0 && !confirm('Giữ dữ liệu cũ và thêm vào cuối?')) {
                        gameHistory = [];
                        currentHand = 0;
                    }
                    
                    // Add each result
                    results.forEach(result => {
                        addResult(result, true); // true = skip update until last
                    });
                    
                    saveToStorage();
                    updateDisplay();
                    showNotification(`✅ Đã nhập ${results.length} kết quả từ ảnh!`);
                }
            } else {
                status.className = 'detection-status error';
                status.textContent = '❌ Không phát hiện được kết quả. Thử ảnh khác hoặc chụp rõ hơn.';
            }
        } catch (error) {
            status.className = 'detection-status error';
            status.textContent = '❌ Lỗi phân tích: ' + error.message;
        }
    }, 500);
}

function detectRoadmap(img) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('imagePreview');
    const status = document.getElementById('detectionStatus');
    
    // Show preview
    preview.style.display = 'block';
    
    // Set canvas size
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Detect circles and analyze colors
    status.textContent = '🔍 Đang phân tích ảnh...';
    
    setTimeout(() => {
        try {
            const results = analyzeRoadmap(imageData, canvas.width, canvas.height);
            
            if (results.length > 0) {
                status.className = 'detection-status success';
                status.textContent = `✅ Phát hiện ${results.length} kết quả: ${results.join('')}`;
                
                // Ask user to import
                if (confirm(`Tìm thấy ${results.length} kết quả:\n${results.join(' ')}\n\nNhập vào hệ thống?`)) {
                    // Clear current data if needed
                    if (gameHistory.length > 0 && !confirm('Giữ dữ liệu cũ và thêm vào?')) {
                        gameHistory = [];
                        currentHand = 0;
                    }
                    
                    // Add each result
                    results.forEach(result => {
                        addResult(result, true); // true = skip update until last
                    });
                    
                    updateDisplay();
                    showNotification(`Đã nhập ${results.length} kết quả từ ảnh!`);
                }
            } else {
                status.className = 'detection-status error';
                status.textContent = '❌ Không phát hiện được kết quả. Thử ảnh khác hoặc chụp rõ hơn.';
            }
        } catch (error) {
            status.className = 'detection-status error';
            status.textContent = '❌ Lỗi phân tích: ' + error.message;
        }
    }, 500);
}

function analyzeRoadmap(imageData, width, height) {
    const results = [];
    const data = imageData.data;
    
    // Grid detection parameters
    const cellSize = 30; // Approximate size of each circle
    const gridCols = Math.floor(width / cellSize);
    const gridRows = Math.floor(height / cellSize);
    
    // Scan from left to right, top to bottom (as per requirement)
    for (let col = 0; col < gridCols; col++) {
        for (let row = 0; row < gridRows; row++) {
            const x = col * cellSize + Math.floor(cellSize / 2);
            const y = row * cellSize + Math.floor(cellSize / 2);
            
            if (x >= width || y >= height) continue;
            
            // Sample color at this position
            const result = detectColorAtPoint(data, x, y, width);
            
            if (result) {
                results.push(result);
            }
        }
    }
    
    return results;
}

function detectColorAtPoint(data, x, y, width) {
    const index = (y * width + x) * 4;
    
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];
    
    // Skip transparent or very light colors (white background)
    if (a < 100 || (r > 200 && g > 200 && b > 200)) {
        return null;
    }
    
    // Color detection thresholds
    // RED (Banker)
    if (r > 150 && g < 100 && b < 100) {
        return 'B';
    }
    
    // BLUE (Player)
    if (b > 150 && r < 100 && g < 100) {
        return 'P';
    }
    
    // GREEN (Tie)
    if (g > 150 && r < 100 && b < 100) {
        return 'T';
    }
    
    return null;
}

function clearImagePreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const input = document.getElementById('imageInput');
    const placeholder = document.getElementById('pastePlaceholder');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const status = document.getElementById('detectionStatus');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
    placeholder.style.display = 'block';
    analyzeBtn.style.display = 'none';
    status.style.display = 'none';
    input.value = '';
    
    showNotification('🗑️ Đã xóa ảnh');
}

// ==========================================
// MONEY MANAGEMENT - MARTINGALE SYSTEM
// ==========================================

// Initialize money management
document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['capital', 'baseBet', 'targetProfit', 'signalAfter'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', updateMoneyConfig);
        }
    });
    
    // Load saved money state
    const savedMoney = localStorage.getItem('moneyState');
    if (savedMoney) {
        moneyState = JSON.parse(savedMoney);
    }
    
    updateMoneyDisplay();
});

function updateMoneyConfig() {
    const capital = parseInt(document.getElementById('capital').value) || 1000000;
    const baseBet = parseInt(document.getElementById('baseBet').value) || 10000;
    const targetProfit = parseInt(document.getElementById('targetProfit').value) || 100000;
    const signalAfter = parseInt(document.getElementById('signalAfter').value) || 3;
    
    moneyConfig = { capital, baseBet, targetProfit, signalAfter };
    
    // Reset state if capital changed
    if (moneyState.currentCapital !== capital) {
        moneyState = {
            currentCapital: capital,
            profitLoss: 0,
            consecutiveLosses: 0,
            currentBet: baseBet,
            totalBets: 0,
            wins: 0,
            losses: 0
        };
    }
    
    updateMoneyDisplay();
    saveMoneyState();
}

function calculateMartingaleBet(losses) {
    // Martingale: double bet after each loss
    return moneyConfig.baseBet * Math.pow(2, losses);
}

function updateMoneyDisplay() {
    // Format currency
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };
    
    // Update values
    document.getElementById('currentCapital').textContent = formatMoney(moneyState.currentCapital);
    
    const profitLossEl = document.getElementById('profitLoss');
    profitLossEl.textContent = (moneyState.profitLoss >= 0 ? '+' : '') + formatMoney(moneyState.profitLoss);
    
    // Update profit card color
    const profitCard = profitLossEl.closest('.money-card');
    if (moneyState.profitLoss < 0) {
        profitCard.classList.add('negative');
    } else {
        profitCard.classList.remove('negative');
    }
    
    document.getElementById('nextBet').textContent = formatMoney(moneyState.currentBet);
    
    // Show signal if needed
    checkSignal();
    
    // Check if target reached
    if (moneyState.profitLoss >= moneyConfig.targetProfit) {
        showNotification(`🎉 Đạt mục tiêu lời: ${formatMoney(moneyState.profitLoss)} VND!`);
    }
    
    // Check if capital too low
    if (moneyState.currentCapital < moneyState.currentBet) {
        alert('⚠️ CẢNH BÁO: Vốn không đủ cho bet tiếp theo!');
    }
}

function checkSignal() {
    const signalBox = document.getElementById('signalBox');
    const signalMessage = document.getElementById('signalMessage');
    
    if (moneyState.consecutiveLosses >= moneyConfig.signalAfter) {
        signalBox.style.display = 'flex';
        
        const winProbability = (Math.pow(0.5, moneyState.consecutiveLosses + 1) * 100).toFixed(2);
        const potentialWin = formatMoney(moneyState.currentBet * 0.95); // Banker pays 0.95:1
        
        signalMessage.innerHTML = `
            Đã thua ${moneyState.consecutiveLosses} lần liên tiếp.<br>
            Xác suất thua tiếp: ~${winProbability}%<br>
            Nếu thắng, thu về: <strong>${potentialWin} VND</strong>
        `;
    } else {
        signalBox.style.display = 'none';
    }
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

function processBetResult(won, betType = 'B') {
    moneyState.totalBets++;
    
    if (won) {
        // Win: get back bet + profit
        // Banker = 1:0.95, Player = 1:1, Tie = 1:8
        let profitRatio = 1;
        if (betType === 'B') {
            profitRatio = 0.95; // Banker pays 0.95:1
        } else if (betType === 'P') {
            profitRatio = 1.0; // Player pays 1:1
        } else if (betType === 'T') {
            profitRatio = 8.0; // Tie pays 8:1
        }
        
        const profit = Math.floor(moneyState.currentBet * profitRatio);
        moneyState.currentCapital += profit;
        moneyState.profitLoss += profit;
        moneyState.wins++;
        moneyState.consecutiveLosses = 0;
        moneyState.currentBet = moneyConfig.baseBet; // Reset to base bet
    } else {
        // Loss: lose bet amount
        moneyState.currentCapital -= moneyState.currentBet;
        moneyState.profitLoss -= moneyState.currentBet;
        moneyState.losses++;
        moneyState.consecutiveLosses++;
        
        // Calculate next bet using Martingale
        moneyState.currentBet = calculateMartingaleBet(moneyState.consecutiveLosses);
    }
    
    updateMoneyDisplay();
    saveMoneyState();
}

function saveMoneyState() {
    localStorage.setItem('moneyState', JSON.stringify(moneyState));
}

// Add button to manually record bet results (optional)
// You can integrate this with prediction results later
