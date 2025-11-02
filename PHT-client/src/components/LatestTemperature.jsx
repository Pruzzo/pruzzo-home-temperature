import { formatDistanceToNow, format, isToday, isYesterday, getMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import './LatestTemperature.css';

const LatestTemperature = ({ temperature, timestamp, minMax, period }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return `oggi alle ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `ieri alle ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'd MMM', { locale: it });
    }
  };

  // Determina colore e messaggio in base alla temperatura e stagione
  const getTemperatureInfo = (temp, timestamp) => {
    if (temp === null) return { color: '#667eea', message: '' };
    
    const month = getMonth(new Date(timestamp)); // 0-11
    const isSummer = month >= 5 && month <= 8; // Giugno-Settembre
    const isWinter = month === 11 || month <= 1; // Dicembre-Febbraio
    
    let color, message;
    
    if (isSummer) {
      // Estate a Genova
      if (temp < 20) {
        color = '#3b82f6'; // Blu
        message = 'Freschino per la stagione';
      } else if (temp < 25) {
        color = '#10b981'; // Verde
        message = 'Temperatura piacevole';
      } else if (temp < 30) {
        color = '#f59e0b'; // Arancione
        message = 'Fa calduccio';
      } else {
        color = '#ef4444'; // Rosso
        message = 'Molto caldo!';
      }
    } else if (isWinter) {
      // Inverno a Genova
      if (temp < 5) {
        color = '#3b82f6'; // Blu
        message = 'Fa proprio freddo';
      } else if (temp < 10) {
        color = '#06b6d4'; // Azzurro
        message = 'Freddino';
      } else if (temp < 15) {
        color = '#10b981'; // Verde
        message = 'Temperatura mite';
      } else {
        color = '#f59e0b'; // Arancione
        message = 'Caldo per la stagione';
      }
    } else {
      // Primavera/Autunno a Genova
      if (temp < 10) {
        color = '#3b82f6'; // Blu
        message = 'Un po\' freddino';
      } else if (temp < 16) {
        color = '#06b6d4'; // Azzurro
        message = 'Fresco';
      } else if (temp < 22) {
        color = '#10b981'; // Verde
        message = 'Temperatura ideale';
      } else if (temp < 26) {
        color = '#f59e0b'; // Arancione
        message = 'Piacevolmente caldo';
      } else {
        color = '#ef4444'; // Rosso
        message = 'Fa caldo';
      }
    }
    
    return { color, message };
  };

  const getPeriodLabel = (period) => {
    switch(period) {
      case 'today': return 'oggi';
      case 1: return 'ultime 24 ore';
      case 3: return 'ultimi 3 giorni';
      case 7: return 'ultimi 7 giorni';
      case 30: return 'ultimi 30 giorni';
      default: return 'periodo selezionato';
    }
  };

  const { color, message } = getTemperatureInfo(temperature, timestamp);

  return (
    <div className="latest-temperature" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
      <div className="temperature-icon">🌡️</div>
      <div className="temperature-content">
        <div className="temperature-label">Temperatura attuale</div>
        <div className="temperature-display">
          <span className="temperature-value">
            {temperature !== null ? `${temperature.toFixed(1)}` : '--'}
          </span>
          <span className="temperature-unit">°C</span>
        </div>
        {message && <div className="temperature-message">{message}</div>}
        <div className="temperature-timestamp">
          <svg className="timestamp-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
            <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"/>
          </svg>
          {timestamp && formatTimestamp(timestamp)}
        </div>
        
        {minMax && (
          <div className="temperature-minmax">
            <div className="minmax-item">
              <span className="minmax-icon">❄️</span>
              <div className="minmax-info">
                <span className="minmax-label">Min {getPeriodLabel(period)}</span>
                <span className="minmax-value">{minMax.min.toFixed(1)}°C</span>
                {minMax.minTime && (
                  <span className="minmax-time">{format(new Date(minMax.minTime), 'HH:mm')}</span>
                )}
              </div>
            </div>
            <div className="minmax-divider"></div>
            <div className="minmax-item">
              <span className="minmax-icon">🔥</span>
              <div className="minmax-info">
                <span className="minmax-label">Max {getPeriodLabel(period)}</span>
                <span className="minmax-value">{minMax.max.toFixed(1)}°C</span>
                {minMax.maxTime && (
                  <span className="minmax-time">{format(new Date(minMax.maxTime), 'HH:mm')}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestTemperature;
