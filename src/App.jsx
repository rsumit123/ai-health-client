import React from 'react';
import Header from './Header/Header';
import SpeechComponent from './SpeechComponent/SpeechComponent';
import "./App.css"

const App = () => {
  return (
    <div className="app-container">
      <Header/>
      <SpeechComponent />
    </div>
  );
};

export default App;
