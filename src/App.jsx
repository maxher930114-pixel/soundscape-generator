import { useState, useRef, useEffect } from 'react' // Added useRef here
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { Howl, Howler } from 'howler'
import './App.css'

const STEMS = [
  { id: 'waves', label: 'Ocean Waves', file: '/audio/Water_Wave.ogg', color: '#4a90e2' },
  { id: 'birds', label: 'Seagulls', file: '/audio/Seagull.ogg', color: '#7ed321' },
  { id: 'shore', label: 'Shore', file: '/audio/Shore.ogg', color: '#4fd1c5' },
  { id: 'harbor', label: 'Harbor', file: '/audio/Harbor.ogg', color: '#3182ce' },
  { id: 'storm', label: 'Storm', file: '/audio/Storm.ogg', color: '#63b3ed' },
];

const CircularSlider = ({ volume, setVolume, label, icon }) => {
  const size = 120;
  const strokeWidth = 15;
  const radius = 40;
  const circumference = radius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  
  // Calculate the "dash" offset based on volume (0 to 1)
  const offset = circumference - (volume * arcLength);

  return (
    <div className="slider-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <circle
          className="slider-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          className="slider-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="slider-content">
        <span className="icon">{icon}</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
      <label>{label}</label>
    </div>
  );
};


function App() {
  // --- 1. ALL STATES AND REFS ---
  const [isEntered, setIsEntered] = useState(false);
  const [volumeState, setVolumeState] = useState({});
  const players = useRef({});
  const [isFading, setIsFading] = useState(false);
  // <--- NEW: Function to handle the Start Button

  useEffect(() => {
    STEMS.forEach((stem) => {
      players.current[stem.id] = new Howl({
        src: [stem.file],
        loop: true,
        volume: 0,
        html5: false,
        preload: true
      });
    });

  const currentPlayers = players.current;

    return () => {
      // 2. Use the captured variable instead of players.current
      Object.values(currentPlayers).forEach(s => s.unload());
    };
  }, []);
  

  const handleEnterSpace = () => {
    // 1. Wake up the browser's audio engine (crucial for some browsers)
    if (Howler.ctx) {
        Howler.ctx.resume();
    }
    setIsFading(true);
    // 2. Change state to hide the intro card and show the mixer
    Object.values(players.current).forEach(sound => {
      if (!sound.playing()) sound.play();
    });
    // 1. Start the fade-out animation

  // 2. Wait for the animation (1 second) before switching the UI
    setTimeout(() => {
      setIsEntered(true);
    }, 1000); // This matches the 1s transition in your CSS
  };

  // --- 2. LOGIC FUNCTIONS ---
  const handleVolume = (id, val) => {    
    const volume = parseFloat(val);   
    const sound = players.current[id];
    
    if (sound) {
      sound.volume(volume);
    }
    
    setVolumeState(prev => ({ ...prev, [id]: volume }));
  };

  const dynamicStyle = {
    '--waves-vol': volumeState['waves'] || 0,
    '--birds-vol': volumeState['birds'] || 0,
    '--shore-vol': volumeState['shore'] || 0,
    '--harbor-vol': volumeState['harbor'] || 0,
    '--storm-vol': volumeState['storm'] || 0,
  };
  // --- 3. THE UI (ONLY ONE RETURN ALLOWED) ---
  return (
    <div className="site-wrapper" style={dynamicStyle}>
      {!isEntered ? (
        /* --- SHOW ONLY THIS IF NOT ENTERED --- */
        <section className={`intro-card ${isFading ? 'fade-out' : ''}`}>
          <h1>SOUNDSCAPE REALM</h1>

          <p id="intro-text">Welcome to your soundscape. Press the button below to begin.</p>
          <button className="enter-button" onClick={handleEnterSpace}>
            Enter...
          </button>
        </section>
      ) : (
        /* --- SHOW ALL OF THIS IF ENTERED --- */
        <div className="mixer-fade-in">
          <section id="center">
            <div className="hero">
              <img src={heroImg} className="base" width="170" height="179" alt="" />
              <img src={reactLogo} className="framework" alt="React logo" />
              <img src={viteLogo} className="vite" alt="Vite logo" />
            </div>
            <div>
              <h2>SOUNDSCAPE GENERATOR</h2>
              <p id="main-text" >Design your own focus environment</p>
            </div>
          </section>

          <div className="ticks"></div>

          <section className="mixer-container">
          
            
          <div className="knob-layout">
              {/* Top Row: First 2 Stems */}
              <div className="knob-row top-row">
                {STEMS.slice(0, 2).map((stem) => (
                  <CircularSlider
                    key={stem.id}
                    label={stem.label}
                    volume={volumeState[stem.id] || 0}
                    setVolume={(val) => handleVolume(stem.id, val)}
                  />
                ))}
              </div>

              {/* Bottom Row: Remaining 3 Stems */}
              <div className="knob-row bottom-row">
                {STEMS.slice(2, 5).map((stem) => (
                  <CircularSlider
                    key={stem.id}
                    label={stem.label}
                    volume={volumeState[stem.id] || 0}
                    setVolume={(val) => handleVolume(stem.id, val)}
                  />
                ))}
              </div>
            </div>
          </section>

          <div className="ticks"></div>
          <section id="spacer"></section>
        </div>
      )}
    </div>
  ); // <--- NOW THIS IS THE ONLY ENDING
}
export default App;