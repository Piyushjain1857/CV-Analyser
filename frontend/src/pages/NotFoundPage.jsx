import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import './NotFoundPage.css';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="notfound-root">
      <div className="notfound-box">
        <div className="notfound-icon">
          <AlertCircle size={44} />
        </div>
        <span className="notfound-code">404 ERROR</span>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          The requested route does not exist or has been moved within CV Insight AI.
        </p>
        <div className="notfound-actions">
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
