import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import './TemperatureChart.css';

const TemperatureChart = ({ data, onPeriodChange, onFilteredDataChange }) => {
  const [period, setPeriod] = useState('today');

  const periods = [
    { label: 'Oggi', value: 'today' },
    { label: '24 ore', value: 1 },
    { label: '3 giorni', value: 3 },
    { label: '7 giorni', value: 7 },
    { label: '30 giorni', value: 30 }
  ];

  // Funzione per determinare il colore in base alla temperatura e stagione
  const getTemperatureColor = (temp, timestamp) => {
    const month = getMonth(new Date(timestamp)); // 0-11
    const isSummer = month >= 5 && month <= 8; // Giugno-Settembre
    const isWinter = month === 11 || month <= 1; // Dicembre-Febbraio
    
    if (isSummer) {
      if (temp < 20) return '#3b82f6'; // Blu
      if (temp < 25) return '#10b981'; // Verde
      if (temp < 30) return '#f59e0b'; // Arancione
      return '#ef4444'; // Rosso
    } else if (isWinter) {
      if (temp < 5) return '#3b82f6'; // Blu
      if (temp < 10) return '#06b6d4'; // Azzurro
      if (temp < 15) return '#10b981'; // Verde
      return '#f59e0b'; // Arancione
    } else {
      if (temp < 10) return '#3b82f6'; // Blu
      if (temp < 16) return '#06b6d4'; // Azzurro
      if (temp < 22) return '#10b981'; // Verde
      if (temp < 26) return '#f59e0b'; // Arancione
      return '#ef4444'; // Rosso
    }
  };

  const filteredData = useMemo(() => {
    const now = Date.now();
    
    if (period === 'today') {
      // Filtra dalla mezzanotte di oggi
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      
      return data
        .filter(item => new Date(item.timestamp).getTime() >= todayMidnight.getTime())
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else {
      // Filtra per periodo in giorni
      const periodMs = period * 24 * 60 * 60 * 1000;
      
      return data
        .filter(item => (now - new Date(item.timestamp).getTime()) <= periodMs)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  }, [data, period]);

  // Notifica il parent component quando cambiano periodo o dati filtrati
  useEffect(() => {
    if (onPeriodChange) {
      onPeriodChange(period);
    }
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [period, filteredData, onPeriodChange, onFilteredDataChange]);

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    
    if (period === 'today' || period === 1) {
      return format(date, 'HH:mm');
    } else if (period <= 7) {
      return format(date, 'd MMM HH:mm', { locale: it });
    } else {
      return format(date, 'd MMM', { locale: it });
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = getTemperatureColor(data.value, data.timestamp);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-temp" style={{ color }}>{`${data.value.toFixed(1)}°C`}</p>
          <p className="tooltip-time">
            {format(new Date(data.timestamp), "d MMM yyyy 'alle' HH:mm", { locale: it })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Dot per colorare i pallini in base alla temperatura
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    
    const color = getTemperatureColor(payload.value, payload.timestamp);
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    );
  };

  // Custom ActiveDot per il punto attivo
  const CustomActiveDot = (props) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    
    const color = getTemperatureColor(payload.value, payload.timestamp);
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="temperature-chart">
      <div className="period-selector">
        {periods.map((p) => (
          <button
            key={p.value}
            className={`period-button ${period === p.value ? 'active' : ''}`}
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      <div className="chart-container">
        {filteredData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  stroke="#666"
                  style={{ fontSize: '0.85rem' }}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  stroke="#666"
                  style={{ fontSize: '0.85rem' }}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#9ca3af" 
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                <span className="legend-label">Freddo</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#06b6d4' }}></span>
                <span className="legend-label">Fresco</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span className="legend-label">Ideale</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span className="legend-label">Caldo</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span>
                <span className="legend-label">Molto caldo</span>
              </div>
            </div>
          </>
        ) : (
          <div className="no-data">
            Nessun dato disponibile per il periodo selezionato
          </div>
        )}
      </div>
    </div>
  );
};

export default TemperatureChart;
