import { formatDistanceToNow, format, isToday, isYesterday, getMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import './LatestTemperature.css';

const LatestTemperature = ({ temperature, timestamp }) => {
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

  const { color, message } = getTemperatureInfo(temperature, timestamp);

  return (
    <div className="latest-temperature" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}>
      <div className="temperature-display">
        <span className="temperature-value">
          {temperature !== null ? `${temperature.toFixed(1)}°C` : '--°C'}
        </span>
      </div>
      {message && <div className="temperature-message">{message}</div>}
      <div className="temperature-timestamp">
        {timestamp && formatTimestamp(timestamp)}
      </div>
    </div>
  );
};

export default LatestTemperature;
