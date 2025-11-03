import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import './TemperatureChart.css';

const TemperatureChart = ({ data, onPeriodChange, onFilteredDataChange }) => {
  const [period, setPeriod] = useState('today');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('auto'); // 'auto' o 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customPeriodStartDate, setCustomPeriodStartDate] = useState('');
  const [customPeriodEndDate, setCustomPeriodEndDate] = useState('');
  
  // Rileva dark mode
  const isDarkMode = document.body.classList.contains('dark-mode');

  const periods = [
    { label: 'Oggi', value: 'today' },
    { label: 'Ieri', value: 'yesterday' },
    { label: '24 ore', value: 1 },
    { label: '3 giorni', value: 3 },
    { label: '7 giorni', value: 7 },
    { label: '30 giorni', value: 30 },
    { label: 'Personalizzato', value: 'custom' }
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
    } else if (period === 'yesterday') {
      // Filtra per ieri (dalla mezzanotte di ieri alla mezzanotte di oggi)
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      
      const yesterdayMidnight = new Date();
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      yesterdayMidnight.setHours(0, 0, 0, 0);
      
      return data
        .filter(item => {
          const time = new Date(item.timestamp).getTime();
          return time >= yesterdayMidnight.getTime() && time < todayMidnight.getTime();
        })
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (period === 'custom') {
      // Periodo personalizzato
      if (!customPeriodStartDate) return [];
      
      const startCustom = new Date(customPeriodStartDate);
      startCustom.setHours(0, 0, 0, 0);
      
      const endCustom = customPeriodEndDate 
        ? new Date(customPeriodEndDate)
        : new Date(customPeriodStartDate);
      endCustom.setHours(23, 59, 59, 999);
      
      return data
        .filter(item => {
          const time = new Date(item.timestamp).getTime();
          return time >= startCustom.getTime() && time <= endCustom.getTime();
        })
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else {
      // Filtra per periodo in giorni
      const periodMs = period * 24 * 60 * 60 * 1000;
      
      return data
        .filter(item => (now - new Date(item.timestamp).getTime()) <= periodMs)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  }, [data, period, customPeriodStartDate, customPeriodEndDate]);

  // Dati del periodo precedente per comparazione
  const previousPeriodData = useMemo(() => {
    if (!showComparison) return [];
    
    // Modalità custom: usa le date selezionate dall'utente
    if (comparisonMode === 'custom' && customStartDate) {
      const startCustom = new Date(customStartDate);
      startCustom.setHours(0, 0, 0, 0);
      
      const endCustom = customEndDate 
        ? new Date(customEndDate)
        : new Date(customStartDate);
      endCustom.setHours(23, 59, 59, 999);
      
      // Filtra i dati nel range custom
      const customData = data
        .filter(item => {
          const time = new Date(item.timestamp).getTime();
          return time >= startCustom.getTime() && time <= endCustom.getTime();
        })
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      if (customData.length === 0) return [];
      
      // Calcola l'offset per allineare i dati custom al periodo corrente
      const firstCustomTime = new Date(customData[0].timestamp).getTime();
      const firstCurrentTime = filteredData.length > 0 
        ? new Date(filteredData[0].timestamp).getTime()
        : Date.now();
      const offset = firstCurrentTime - firstCustomTime;
      
      return customData.map(item => ({
        ...item,
        timestamp: new Date(new Date(item.timestamp).getTime() + offset).toISOString(),
        isPrevious: true
      }));
    }
    
    // Modalità auto: periodo precedente automatico
    const now = Date.now();
    
    if (period === 'today') {
      // Ieri stesso orario
      const yesterdayMidnight = new Date();
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
      yesterdayMidnight.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      
      return data
        .filter(item => {
          const time = new Date(item.timestamp).getTime();
          return time >= yesterdayMidnight.getTime() && time <= yesterdayEnd.getTime();
        })
        .map(item => ({
          ...item,
          // Sposta il timestamp di 1 giorno avanti per allinearlo
          timestamp: new Date(new Date(item.timestamp).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          isPrevious: true
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (period === 'yesterday') {
      // L'altro ieri (2 giorni fa)
      const twoDaysAgoMidnight = new Date();
      twoDaysAgoMidnight.setDate(twoDaysAgoMidnight.getDate() - 2);
      twoDaysAgoMidnight.setHours(0, 0, 0, 0);
      
      const twoDaysAgoEnd = new Date();
      twoDaysAgoEnd.setDate(twoDaysAgoEnd.getDate() - 2);
      twoDaysAgoEnd.setHours(23, 59, 59, 999);
      
      return data
        .filter(item => {
          const time = new Date(item.timestamp).getTime();
          return time >= twoDaysAgoMidnight.getTime() && time <= twoDaysAgoEnd.getTime();
        })
        .map(item => ({
          ...item,
          // Sposta il timestamp di 1 giorno avanti per allinearlo a ieri
          timestamp: new Date(new Date(item.timestamp).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          isPrevious: true
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else {
      // Periodo precedente dello stesso range
      const periodMs = period * 24 * 60 * 60 * 1000;
      const startPrevious = now - (periodMs * 2);
      const endPrevious = now - periodMs;
      
      return data
        .filter(item => {
          const time = new Date(item.timestamp).getTime();
          return time >= startPrevious && time < endPrevious;
        })
        .map(item => ({
          ...item,
          // Sposta il timestamp in avanti per allinearlo al periodo corrente
          timestamp: new Date(new Date(item.timestamp).getTime() + periodMs).toISOString(),
          isPrevious: true
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  }, [data, period, showComparison, comparisonMode, customStartDate, customEndDate, filteredData]);

  // Combina i dati correnti e precedenti
  const combinedData = useMemo(() => {
    if (!showComparison || previousPeriodData.length === 0) {
      return filteredData;
    }
    
    // Crea una mappa per timestamp
    const dataMap = new Map();
    
    // Aggiungi dati correnti
    filteredData.forEach(item => {
      const key = item.timestamp;
      dataMap.set(key, { timestamp: key, value: item.value });
    });
    
    // Aggiungi dati precedenti
    previousPeriodData.forEach(item => {
      const key = item.timestamp;
      if (dataMap.has(key)) {
        dataMap.get(key).previousValue = item.value;
      } else {
        dataMap.set(key, { timestamp: key, previousValue: item.value });
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [filteredData, previousPeriodData, showComparison]);

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
    
    if (period === 'today' || period === 'yesterday' || period === 1) {
      return format(date, 'HH:mm');
    } else if (period <= 7) {
      return format(date, 'd MMM HH:mm', { locale: it });
    } else {
      return format(date, 'd MMM', { locale: it });
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          {payload.map((entry, index) => {
            const color = entry.dataKey === 'value' 
              ? getTemperatureColor(entry.value, entry.payload.timestamp)
              : '#9ca3af';
            const label = entry.dataKey === 'value' ? 'Attuale' : 'Precedente';
            return (
              <div key={index}>
                <p className="tooltip-temp" style={{ color }}>
                  {`${label}: ${entry.value.toFixed(1)}°C`}
                </p>
              </div>
            );
          })}
          <p className="tooltip-time">
            {format(new Date(payload[0].payload.timestamp), "d MMM yyyy 'alle' HH:mm", { locale: it })}
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
      <div className="chart-header">
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
        
        <button 
          className={`comparison-toggle ${showComparison ? 'active' : ''}`}
          onClick={() => setShowComparison(!showComparison)}
          title="Confronta con periodo precedente"
        >
          📊 Confronta
        </button>
      </div>
      
      {/* Selettore periodo principale personalizzato */}
      {period === 'custom' && (
        <div className="custom-period-settings">
          <div className="custom-date-range">
            <div className="date-input-group">
              <label htmlFor="periodStartDate">Da:</label>
              <input
                id="periodStartDate"
                type="date"
                value={customPeriodStartDate}
                onChange={(e) => setCustomPeriodStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="periodEndDate">A:</label>
              <input
                id="periodEndDate"
                type="date"
                value={customPeriodEndDate}
                onChange={(e) => setCustomPeriodEndDate(e.target.value)}
                min={customPeriodStartDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            {!customPeriodEndDate && customPeriodStartDate && (
              <span className="date-hint">Lascia vuoto per visualizzare un singolo giorno</span>
            )}
          </div>
        </div>
      )}
      
      {/* Selettore periodo personalizzato */}
      {showComparison && (
        <div className="comparison-settings">
          <div className="comparison-mode">
            <label>
              <input
                type="radio"
                value="auto"
                checked={comparisonMode === 'auto'}
                onChange={(e) => setComparisonMode(e.target.value)}
              />
              <span>Periodo precedente</span>
            </label>
            <label>
              <input
                type="radio"
                value="custom"
                checked={comparisonMode === 'custom'}
                onChange={(e) => setComparisonMode(e.target.value)}
              />
              <span>Periodo personalizzato</span>
            </label>
          </div>
          
          {comparisonMode === 'custom' && (
            <div className="custom-date-range">
              <div className="date-input-group">
                <label htmlFor="startDate">Da:</label>
                <input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">A:</label>
                <input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {!customEndDate && customStartDate && (
                <span className="date-hint">Lascia vuoto per confrontare un singolo giorno</span>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="chart-container">
        {filteredData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  stroke={isDarkMode ? '#a0a0b0' : '#666'}
                  style={{ fontSize: '0.85rem' }}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  stroke={isDarkMode ? '#a0a0b0' : '#666'}
                  style={{ fontSize: '0.85rem' }}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Linea periodo precedente */}
                {showComparison && (
                  <Line 
                    type="monotone" 
                    dataKey="previousValue" 
                    stroke={isDarkMode ? '#fb923c' : '#f97316'}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ fill: isDarkMode ? '#fb923c' : '#f97316', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 7, fill: isDarkMode ? '#fb923c' : '#f97316', stroke: 'white', strokeWidth: 2 }}
                    name="Precedente"
                    strokeOpacity={0.8}
                  />
                )}
                
                {/* Linea periodo corrente */}
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
              {showComparison && (
                <>
                  <div className="legend-item">
                    <div className="legend-line-comparison" style={{ 
                      background: isDarkMode ? '#fb923c' : '#f97316',
                      borderTop: `3px dashed ${isDarkMode ? '#fb923c' : '#f97316'}`,
                      height: '0'
                    }}></div>
                    <span className="legend-label">Periodo precedente</span>
                  </div>
                  <div className="legend-divider-small"></div>
                </>
              )}
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                <span className="legend-label">Freddo</span>
              </div>
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
