import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Helper to render App with providers
const renderApp = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('App Component', () => {
  it('should render the application', () => {
    renderApp();
    // Check if the app renders without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should render navbar', () => {
    renderApp();
    // Navbar should be present (check for logo or nav elements)
    const navbar = document.querySelector('nav');
    expect(navbar).toBeInTheDocument();
  });
});
