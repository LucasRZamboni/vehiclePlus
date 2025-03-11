import React, { useState } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { InspectionForm } from './components/inspection/InspectionForm';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <InspectionForm />;
}

export default App;