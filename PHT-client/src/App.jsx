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
          <h1>Monitoraggio Temperatura</h1>
          <div className="loading">Caricamento dati...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="container">
          <h1>Monitoraggio Temperatura</h1>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Monitoraggio Temperatura</h1>
        
        {latestTemp && (
          <LatestTemperature 
            temperature={latestTemp.value} 
            timestamp={latestTemp.timestamp} 
          />
        )}
        
        {temperatures.length > 0 ? (
          <TemperatureChart data={temperatures} />
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
