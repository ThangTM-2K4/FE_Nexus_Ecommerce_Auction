import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SellerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/seller-hub/overview', { replace: true });
  }, [navigate]);

  return null;
}

export default SellerDashboard;
