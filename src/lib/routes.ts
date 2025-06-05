import { createBrowserRouter } from 'react-router';
import App from '../App';
import LoginResultPage from '../LoginResultPage';

const router = createBrowserRouter([
  { path: '/', Component: App },
  { path: '/auth/result', Component: LoginResultPage }
]);

export default router;
