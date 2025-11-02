import { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue } from 'firebase/database';
import LatestTemperature from './components/LatestTemperature';
import TemperatureChart from './components/TemperatureChart';
import './App.css';

function App() {
  const [temperatures, setTemperatures] = useState([]);
  const [latestTemp, setLatestTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('today');
  const [filteredData, setFilteredData] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Recupera la preferenza salvata o usa la preferenza di sistema
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Applica la dark mode al body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const temperaturesRef = ref(database, 'temperatures');
    
    const unsubscribe = onValue(temperaturesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
        if (data) {
          // Converti l'oggetto in array
          const temperatureArray = Object.keys(data).map(key => ({
            id: key,
            timestamp: data[key].timestamp,
            value: parseFloat(data[key].value)
          }));
          
          // Ordina per timestamp decrescente per trovare l'ultima
          const sortedTemps = [...temperatureArray].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          
          setTemperatures(temperatureArray);
          setLatestTemp(sortedTemps[0]);
        } else {
          setTemperatures([]);
          setLatestTemp(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Errore nel processare i dati:', err);
        setError('Errore nel caricamento dei dati');
        setLoading(false);
      }
    }, (error) => {
      console.error('Errore Firebase:', error);
      setError('Errore di connessione al database');
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <header className="app-header">
            <div className="header-icon">🏠</div>
            <h1 className="app-title">
              <span className="title-main">Monitoraggio Temperatura</span>
              <span className="title-sub">Casa • Comago (GE)</span>
            </h1>
          </header>
          <div className="loading">Caricamento dati...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="container">
          <header className="app-header">
            <div className="header-icon">🏠</div>
            <h1 className="app-title">
              <span className="title-main">Monitoraggio Temperatura</span>
              <span className="title-sub">Casa • Comago (GE)</span>
            </h1>
          </header>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <div className="header-icon">🏠</div>
          <h1 className="app-title">
            <span className="title-main">Monitoraggio Temperatura</span>
            <span className="title-sub">Casa • Comago (GE)</span>
          </h1>
          <button className="dark-mode-toggle" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>
        
        {latestTemp && (
          <LatestTemperature 
            temperature={latestTemp.value} 
            timestamp={latestTemp.timestamp}
            minMax={filteredData.length > 0 ? {
              min: Math.min(...filteredData.map(d => d.value)),
              max: Math.max(...filteredData.map(d => d.value)),
              minTime: filteredData.find(d => d.value === Math.min(...filteredData.map(x => x.value)))?.timestamp,
              maxTime: filteredData.find(d => d.value === Math.max(...filteredData.map(x => x.value)))?.timestamp
            } : null}
            period={currentPeriod}
          />
        )}
        
        {temperatures.length > 0 ? (
          <TemperatureChart 
            data={temperatures}
            onPeriodChange={setCurrentPeriod}
            onFilteredDataChange={setFilteredData}
          />
        ) : (
          <div className="no-data-message">
            Nessun dato disponibile
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
