/**
 * Formats large numbers into compact representation
 * Examples: 
 * - 1500 -> "1.5K"
 * - 2900000 -> "2.9M" 
 * - 1200000000 -> "1.2B"
 * - 999 -> "999" (no formatting for numbers < 1000)
 */
export const formatLargeNumber = (num: number): string => {
    if (num < 1000) {
        return Math.round(num).toString();
    }
    
    const units = [
        { value: 1_000_000_000_000, suffix: 'T' }, // Trillion
        { value: 1_000_000_000, suffix: 'B' },     // Billion
        { value: 1_000_000, suffix: 'M' },        // Million
        { value: 1_000, suffix: 'K' }             // Thousand
    ];
    
    for (const unit of units) {
        if (num >= unit.value) {
            const formatted = num / unit.value;
            // Show 1 decimal place if the result is less than 10, otherwise round to whole number
            const decimalPlaces = formatted < 10 ? 1 : 0;
            return formatted.toFixed(decimalPlaces).replace(/\.0$/, '') + unit.suffix;
        }
    }
    
    return Math.round(num).toString();
};

/**
 * Formats resource display text for current/max values
 * Examples:
 * - formatResourceDisplay(2900, 2900) -> "2.9K/2.9K"
 * - formatResourceDisplay(1500, 5000) -> "1.5K/5K"
 * - formatResourceDisplay(999, 1000) -> "999/1K"
 */
export const formatResourceDisplay = (current: number, max: number): string => {
    const formattedCurrent = formatLargeNumber(current);
    const formattedMax = formatLargeNumber(max);
    return `${formattedCurrent}/${formattedMax}`;
};

/**
 * Formats resource display text when max is very large (>= 1M)
 * For very large max values, we only show current amount
 * Examples:
 * - formatResourceDisplay(2900, 5000000) -> "2.9K"
 * - formatResourceDisplay(1500, 999) -> "1.5K/999"
 */
export const formatResourceDisplaySmart = (current: number, max: number): string => {
    if (max >= 1_000_000) {
        return formatLargeNumber(current);
    }
    return formatResourceDisplay(current, max);
}; 