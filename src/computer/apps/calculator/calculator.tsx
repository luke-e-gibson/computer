import { useState, useEffect } from "react";
import './calculator.css';

export default function CalculatorApp() {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('');

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [expression]);

    const handleKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();
        const key = event.key;

        if (key === 'Enter') {
            handleButtonClick('=');
        } else if (key === 'Escape') {
            handleButtonClick('C');
        } else if (key === 'Backspace') {
            setExpression(prev => prev.slice(0, -1));
        } else if (/[\d+\-*/.()=]/.test(key)) {
            handleButtonClick(key);
        }
    };

    const handleButtonClick = (value: string) => {
        if (value === '=') {
            try {
                // Evaluate the expression and update the result
                setResult(eval(expression));
            } catch (error) {
                setResult('Error');
            }
        } else if (value === 'C') {
            // Clear the expression and result
            setExpression('');
            setResult('');
        } else {
            // Update the expression
            setExpression((prev) => prev + value);
        }
    };
    
    return (
        <div className="calculator-app">
            <div className="calculator-display">
                <div>{expression || '0'}</div>
                {result && (
                    <div className="calculator-result">
                        <span className="equals-sign">=</span>
                        {result}
                    </div>
                )}
            </div>
            <div className="calculator-buttons">
                <button className="calculator-button clear" onClick={() => handleButtonClick('C')}>C</button>
                <button className="calculator-button operator" onClick={() => handleButtonClick('(')}>(</button>
                <button className="calculator-button operator" onClick={() => handleButtonClick(')')}>)</button>
                <button className="calculator-button operator" onClick={() => handleButtonClick('/')}>/</button>
                
                <button className="calculator-button number" onClick={() => handleButtonClick('7')}>7</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('8')}>8</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('9')}>9</button>
                <button className="calculator-button operator" onClick={() => handleButtonClick('*')}>×</button>
                
                <button className="calculator-button number" onClick={() => handleButtonClick('4')}>4</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('5')}>5</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('6')}>6</button>
                <button className="calculator-button operator" onClick={() => handleButtonClick('-')}>−</button>
                
                <button className="calculator-button number" onClick={() => handleButtonClick('1')}>1</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('2')}>2</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('3')}>3</button>
                <button className="calculator-button operator" onClick={() => handleButtonClick('+')}>+</button>
                
                <button className="calculator-button number" onClick={() => handleButtonClick('0')}>0</button>
                <button className="calculator-button number" onClick={() => handleButtonClick('.')}>.</button>
                <button className="calculator-button equals" onClick={() => handleButtonClick('=')}>=</button>
            </div>
        </div>
    );
}