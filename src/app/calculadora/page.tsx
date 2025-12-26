'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent, RefreshCw, ArrowRightLeft } from 'lucide-react';
import styles from './calculadora.module.css';

interface DolarRate {
    compra: number;
    venta: number;
    fecha: string;
}

export default function CalculadoraPage() {
    const [activeTab, setActiveTab] = useState<'margen' | 'dolar'>('margen');

    // Estado Calculadora Margen
    const [precioCompra, setPrecioCompra] = useState<number>(0);
    const [margenDeseado, setMargenDeseado] = useState<number>(30);

    // Estado Conversor Dolar
    const [dolarOficial, setDolarOficial] = useState<DolarRate | null>(null);
    const [dolarBlue, setDolarBlue] = useState<DolarRate | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [currency, setCurrency] = useState<'ARS' | 'USD'>('USD'); // Moneda de origen
    const [loadingDolar, setLoadingDolar] = useState(false);

    // Fetch Dolar
    const fetchDolar = async () => {
        setLoadingDolar(true);
        try {
            const resOficial = await fetch('https://dolarapi.com/v1/dolares/oficial');
            const dataOficial = await resOficial.json();
            setDolarOficial(dataOficial);

            const resBlue = await fetch('https://dolarapi.com/v1/dolares/blue');
            const dataBlue = await resBlue.json();
            setDolarBlue(dataBlue);
        } catch (error) {
            console.error('Error fetching dolar:', error);
        } finally {
            setLoadingDolar(false);
        }
    };

    useEffect(() => {
        fetchDolar();
    }, []);

    // Cálculos Margen
    const precioVenta = precioCompra > 0 ? precioCompra * (1 + margenDeseado / 100) : 0;
    const ganancia = precioVenta - precioCompra;
    const margenReal = precioCompra > 0 ? (ganancia / precioCompra) * 100 : 0;

    const formatCurrency = (value: number, curr: 'ARS' | 'USD' = 'ARS') => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: curr,
            minimumFractionDigits: curr === 'USD' ? 2 : 0,
            maximumFractionDigits: curr === 'USD' ? 2 : 0,
        }).format(value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <Calculator size={48} />
                <h1>Calculadora & Conversor</h1>
                <p>Herramientas útiles para potenciar tu negocio</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'margen' ? styles.active : ''}`}
                    onClick={() => setActiveTab('margen')}
                >
                    <Percent size={20} /> Calculadora de Margen
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'dolar' ? styles.active : ''}`}
                    onClick={() => setActiveTab('dolar')}
                >
                    <DollarSign size={20} /> Conversor de Moneda
                </button>
            </div>

            {activeTab === 'margen' ? (
                /* CALCULADORA DE MARGEN */
                <div className={styles.calculatorCard}>
                    <div className={styles.inputSection}>
                        <h2>📊 Calcular Precio de Venta</h2>

                        <div className={styles.inputGroup}>
                            <label>
                                <DollarSign size={20} />
                                Precio de Compra Mayorista
                            </label>
                            <input
                                type="number"
                                value={precioCompra || ''}
                                onChange={(e) => setPrecioCompra(Number(e.target.value))}
                                placeholder="Ej: 50000"
                                min="0"
                            />
                            <span className={styles.hint}>¿Cuánto te cuesta el producto?</span>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>
                                <Percent size={20} />
                                Margen de Ganancia Deseado (%)
                            </label>
                            <input
                                type="range"
                                value={margenDeseado}
                                onChange={(e) => setMargenDeseado(Number(e.target.value))}
                                min="0"
                                max="100"
                                step="5"
                            />
                            <div className={styles.rangeValue}>{margenDeseado}%</div>
                            <span className={styles.hint}>Deslizá para ajustar tu margen</span>
                        </div>
                    </div>

                    {precioCompra > 0 && (
                        <div className={styles.resultsSection}>
                            <h2>💰 Tus Resultados</h2>

                            <div className={styles.resultsGrid}>
                                <div className={styles.resultCard}>
                                    <TrendingUp size={32} className={styles.iconSuccess} />
                                    <div>
                                        <p className={styles.resultLabel}>Precio de Venta Sugerido</p>
                                        <p className={styles.resultValue}>{formatCurrency(precioVenta)}</p>
                                    </div>
                                </div>

                                <div className={styles.resultCard}>
                                    <DollarSign size={32} className={styles.iconProfit} />
                                    <div>
                                        <p className={styles.resultLabel}>Ganancia por Unidad</p>
                                        <p className={styles.resultValue}>{formatCurrency(ganancia)}</p>
                                    </div>
                                </div>

                                <div className={styles.resultCard}>
                                    <Percent size={32} className={styles.iconInfo} />
                                    <div>
                                        <p className={styles.resultLabel}>Margen Real</p>
                                        <p className={styles.resultValue}>{margenReal.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.exampleSection}>
                                <h3>📈 Proyección de Ventas</h3>
                                <div className={styles.exampleGrid}>
                                    {[10, 50, 100].map(qty => (
                                        <div key={qty} className={styles.exampleCard}>
                                            <p className={styles.exampleQty}>{qty} unidades</p>
                                            <p className={styles.exampleProfit}>
                                                Ganancia: <strong>{formatCurrency(ganancia * qty)}</strong>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.tips}>
                                <h3>💡 Consejos Yeah!</h3>
                                <ul>
                                    <li>
                                        <strong>Margen recomendado:</strong> Entre 25% y 40% para productos tech.
                                    </li>
                                    <li>
                                        <strong>Competitividad:</strong> Revisá los precios del mercado para no quedarte afuera.
                                    </li>
                                    <li>
                                        <strong>Volumen:</strong> A mayor volumen de venta, podés ajustar el margen a la baja.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* CONVERSOR DE MONEDA */
                <div className={styles.calculatorCard}>
                    <div className={styles.dolarHeader}>
                        <h2>💱 Conversor en Tiempo Real</h2>
                        <button onClick={fetchDolar} className={styles.refreshBtn} disabled={loadingDolar}>
                            <RefreshCw size={20} className={loadingDolar ? styles.spinning : ''} />
                            Actualizar
                        </button>
                    </div>

                    <div className={styles.quotesGrid}>
                        <div className={styles.quoteCard}>
                            <h3>Dólar Oficial</h3>
                            <div className={styles.quoteValues}>
                                <div>
                                    <span>Compra</span>
                                    <p>${dolarOficial?.compra || '-'}</p>
                                </div>
                                <div>
                                    <span>Venta</span>
                                    <p>${dolarOficial?.venta || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.quoteCard} ${styles.blueCard}`}>
                            <h3>Dólar Blue</h3>
                            <div className={styles.quoteValues}>
                                <div>
                                    <span>Compra</span>
                                    <p>${dolarBlue?.compra || '-'}</p>
                                </div>
                                <div>
                                    <span>Venta</span>
                                    <p>${dolarBlue?.venta || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.converterSection}>
                        <div className={styles.inputGroup}>
                            <label>Monto a Convertir</label>
                            <div className={styles.currencyInput}>
                                <input
                                    type="number"
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    placeholder="0"
                                />
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as 'ARS' | 'USD')}
                                >
                                    <option value="USD">USD (Dólares)</option>
                                    <option value="ARS">ARS (Pesos)</option>
                                </select>
                            </div>
                        </div>

                        {amount > 0 && dolarBlue && (
                            <div className={styles.conversionResults}>
                                <div className={styles.conversionRow}>
                                    <span className={styles.convLabel}>
                                        {currency === 'USD' ? 'Equivale a (Blue Venta):' : 'Equivale a (Blue Compra):'}
                                    </span>
                                    <span className={styles.convValue}>
                                        {currency === 'USD'
                                            ? formatCurrency(amount * dolarBlue.venta, 'ARS')
                                            : formatCurrency(amount / dolarBlue.compra, 'USD')}
                                    </span>
                                </div>
                                <div className={styles.conversionRowSmall}>
                                    <span>Oficial:</span>
                                    <span>
                                        {currency === 'USD'
                                            ? formatCurrency(amount * (dolarOficial?.venta || 0), 'ARS')
                                            : formatCurrency(amount / (dolarOficial?.compra || 1), 'USD')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
