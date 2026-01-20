import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { FaArrowLeft, FaChartLine, FaCashRegister, FaCalendarCheck, FaBalanceScale } from 'react-icons/fa';

const MetricasNegocio = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnualReal: 0,
    promedioMensual: 0,
    totalDiferencias: 0, // Diferencia entre sistema y efectivo real
    ventasPorMes: Array(12).fill(0),
    diasReportados: 0
  });

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  useEffect(() => {
    const fetchMetricasDesdeCierres = async () => {
      try {
        const currentYear = new Date().getFullYear();
        // Filtramos por los cierres de caja de este año
        const q = query(collection(db, 'daily_closing_reports'));
        const querySnapshot = await getDocs(q);
        
        let acumuladoAnual = 0;
        let diferenciaTotal = 0;
        let mesesData = Array(12).fill(0);
        let contadorCierres = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const fecha = data.timestamp?.toDate() || new Date(data.date);
          
          // Solo procesar si es del año actual
          if (fecha.getFullYear() === currentYear) {
            // Calculamos el total real del día (Efectivo Real + Yappy Sistema + Tarjeta Sistema)
            const efectivoReal = parseFloat(data.cashReported) || 0;
            const yappy = parseFloat(data.systemTotals?.yappy) || 0;
            const tarjeta = parseFloat(data.systemTotals?.tarjeta) || 0;
            const sistemaEfectivo = parseFloat(data.systemTotals?.efectivo) || 0;

            const totalDia = efectivoReal + yappy + tarjeta;
            const diffDia = efectivoReal - sistemaEfectivo;

            const mesIndex = fecha.getMonth();
            
            acumuladoAnual += totalDia;
            diferenciaTotal += diffDia;
            mesesData[mesIndex] += totalDia;
            contadorCierres++;
          }
        });

        // Promedio basado en meses transcurridos (ej: si estamos en marzo, divide entre 3)
        const mesActual = new Date().getMonth() + 1;
        const promedio = acumuladoAnual / mesActual;

        setStats({
          totalAnualReal: acumuladoAnual,
          promedioMensual: promedio,
          totalDiferencias: diferenciaTotal,
          ventasPorMes: mesesData,
          diasReportados: contadorCierres
        });
      } catch (error) {
        console.error("Error cargando cierres de caja:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricasDesdeCierres();
  }, []);

  if (loading) return <div className="p-10 text-center">Cargando datos de cierres de caja...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Botón Volver */}
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-orange-600 font-bold">
        <FaArrowLeft /> VOLVER AL MENÚ
      </button>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <FaChartLine /> RENDIMIENTO ANUAL {new Date().getFullYear()}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* MÉTRICA PRINCIPAL: PROMEDIO MENSUAL */}
          <div className="bg-white border-b-4 border-orange-500 rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Promedio Generado / Mes</p>
            <h2 className="text-4xl font-black text-gray-800 mt-2">
              ${stats.promedioMensual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 mt-4 text-orange-600 text-sm font-bold">
              <FaCalendarCheck /> Basado en {stats.diasReportados} cierres
            </div>
          </div>

          {/* TOTAL ANUAL REAL */}
          <div className="bg-white border-b-4 border-green-500 rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Real Acumulado</p>
            <h2 className="text-4xl font-black text-gray-800 mt-2">
              ${stats.totalAnualReal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-gray-400 text-xs mt-4">Venta neta confirmada en cierres</p>
          </div>

          {/* DIFERENCIAS DE CAJA */}
          <div className="bg-white border-b-4 border-blue-500 rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Balance de Diferencias</p>
            <h2 className={`text-4xl font-black mt-2 ${stats.totalDiferencias < 0 ? 'text-red-500' : 'text-blue-600'}`}>
              ${stats.totalDiferencias.toFixed(2)}
            </h2>
            <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
              <FaBalanceScale /> {stats.totalDiferencias >= 0 ? 'Sobrante total' : 'Faltante total'}
            </div>
          </div>
        </div>

        {/* GRÁFICO DE BARRAS */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 font-bold mb-8 uppercase text-sm tracking-widest">Flujo de Ingresos por Mes</h3>
          <div className="flex items-end justify-between h-64 gap-3">
            {stats.ventasPorMes.map((monto, i) => {
              const porcentaje = (monto / Math.max(...stats.ventasPorMes, 1)) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                  <div className="relative w-full flex flex-col items-center group">
                    {monto > 0 && (
                      <span className="absolute -top-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ${monto.toFixed(0)}
                      </span>
                    )}
                    <div 
                      className="w-full max-w-[40px] bg-orange-400 rounded-t-lg transition-all duration-500 hover:bg-orange-600 shadow-sm"
                      style={{ height: `${porcentaje}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase rotate-45 md:rotate-0">
                    {meses[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricasNegocio;