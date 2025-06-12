// Get references to DOM elements
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const historyListElement = document.getElementById('history-list');
const noHistoryMessage = document.getElementById('no-history-message');
const calculatorButtons = document.querySelectorAll('.calculator-button');

// Calculator class to manage state and operations
class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, historyListElement, noHistoryMessage) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.historyListElement = historyListElement;
        this.noHistoryMessage = noHistoryMessage;
        this.clear(); // Initialize calculator state
        this.history = []; // Array to store calculation history
    }

    /**
     * Clears all inputs and resets the calculator state.
     */
    clear() {
        this.currentOperand = '0'; // Current input/result
        this.previousOperand = ''; // Previous input before an operation
        this.operation = undefined; // Current operation (+, -, *, /)
        this.updateDisplay(); // Update display to reflect changes
    }

    /**
     * Removes the last character from the current operand.
     */
    backspace() {
        // If the current operand is '0' or empty, do nothing
        if (this.currentOperand === '0' || this.currentOperand === '') return;

        // Remove the last character
        this.currentOperand = this.currentOperand.slice(0, -1);

        // If after backspace the current operand is empty, set it to '0'
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
        this.updateDisplay();
    }

    /**
     * Appends a number or a decimal point to the current operand.
     * Prevents multiple decimal points.
     * @param {string} number - The digit or decimal point to append.
     */
    appendNumber(number) {
        // Prevent adding multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // If current operand is '0' and the new number is not a decimal, replace '0'
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    /**
     * Sets the operation and moves the current operand to the previous operand.
     * If there's already a previous operand, it computes the result first.
     * @param {string} operation - The arithmetic operation (+, -, *, /).
     */
    chooseOperation(operation) {
        if (this.currentOperand === '') return; // Do nothing if no current operand

        // If a previous operand exists, compute the result before setting a new operation
        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        // Move current operand to previous operand for the next input
        this.previousOperand = this.currentOperand;
        this.currentOperand = ''; // Clear current operand for new input
        this.updateDisplay();
    }

    /**
     * Performs the calculation based on the current operation.
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Check if inputs are valid numbers
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    // For a real application, consider a custom modal or message display
                    // instead of alert() as it blocks the UI.
                    // Example: displayErrorMessage("Cannot divide by zero!");
                    alert("Cannot divide by zero!");
                    this.clear(); // Clear calculator on error
                    return;
                }
                computation = prev / current;
                break;
            default:
                return; // No operation selected
        }

        // Format the expression and result for history
        const expression = `${this.previousOperand} ${this.operation} ${this.currentOperand}`;
        this.addHistory(expression, computation);

        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    /**
     * Displays the formatted number.
     * Adds commas for thousands separator.
     * @param {number|string} number - The number to format.
     * @returns {string} The formatted number string.
     */
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    /**
     * Updates the calculator display with current and previous operands.
     */
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    /**
     * Adds a calculation to the history list.
     * @param {string} expression - The full calculation expression (e.g., "5 + 3").
     * @param {number} result - The result of the calculation.
     */
    addHistory(expression, result) {
        this.history.unshift({ // Add to the beginning of the array
            expression: expression,
            result: this.getDisplayNumber(result)
        });
        // Keep history list to a reasonable length, e.g., last 10 items
        if (this.history.length > 10) {
            this.history.pop();
        }
        this.renderHistory();
    }

    /**
     * Renders the calculation history in the history section.
     */
    renderHistory() {
        this.historyListElement.innerHTML = ''; // Clear existing history
        if (this.history.length === 0) {
            this.noHistoryMessage.style.display = 'block';
        } else {
            this.noHistoryMessage.style.display = 'none';
            this.history.forEach(item => {
                const historyItemDiv = document.createElement('div');
                historyItemDiv.classList.add('history-item');
                historyItemDiv.innerHTML = `
                    <span class="history-expression">${item.expression}</span>
                    <span class="history-result">= ${item.result}</span>
                `;
                this.historyListElement.appendChild(historyItemDiv);
            });
        }
    }
}

// Instantiate the Calculator
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement, noHistoryMessage);

// Event listener for button clicks
calculatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        const number = button.dataset.number;
        const operator = button.dataset.operator;
        const action = button.dataset.action;

        if (number != null) {
            calculator.appendNumber(number);
        } else if (operator != null) {
            calculator.chooseOperation(operator);
        } else if (action === 'equals') {
            calculator.compute();
        } else if (action === 'clear') {
            calculator.clear();
        } else if (action === 'backspace') {
            calculator.backspace();
        }
    });
});

// Event listener for keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
    } else if (e.key === '.') {
        calculator.appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        calculator.compute();
    } else if (e.key === 'Backspace') {
        calculator.backspace();
    } else if (e.key === 'Escape') { // 'Escape' key for clear
        calculator.clear();
    }
});

// Initial render of history (will show "No history yet.")
calculator.renderHistory();
