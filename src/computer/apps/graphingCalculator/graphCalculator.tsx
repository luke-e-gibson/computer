import { useState, useEffect, useRef } from "react";
import './graphCalculator.css';

export default function GraphingCalulator() {
    const calcElm = useRef<HTMLDivElement>(null);
    const [calculator, setCalculator] = useState<Desmos.Calculator | null>(null);

    useEffect(() => {
        if (typeof window.Desmos === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
            script.async = true;
            script.onload = () => {
                if (calcElm.current) {
                    const calc = Desmos.GraphingCalculator(calcElm.current, {});
                    setCalculator(calc);
                }
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        } else if (calcElm.current && !calculator) {
            const calc = Desmos.GraphingCalculator(calcElm.current, {});
            setCalculator(calc);
        }
    }, [calculator]);
    
    return (
        <div className="graphing-calculator">
            <div ref={calcElm} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}