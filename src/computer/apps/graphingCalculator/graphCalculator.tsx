import { useState, useEffect, useRef } from "react";
import './graphCalculator.css';

declare global {
    interface Window {
        Desmos?: {
            GraphingCalculator: (element: HTMLElement, options: any) => any;
        }
    }
}

export default function GraphingCalulator() {
    const calcElm = useRef<HTMLDivElement>(null);
    const [calculator, setCalculator] = useState<any>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!scriptLoaded && !window.Desmos) {
            const script = document.createElement('script');
            script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
            script.async = true;
            script.onload = () => {
                setScriptLoaded(true);
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [scriptLoaded]);

    useEffect(() => {
        if (scriptLoaded && calcElm.current && !calculator && window.Desmos) {
            const calc = window.Desmos.GraphingCalculator(calcElm.current, {});
            setCalculator(calc);
        }
    }, [scriptLoaded, calculator]);
    
    return (
        <div className="graphing-calculator">
            <div ref={calcElm} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}