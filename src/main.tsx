import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
// import { NotificationProvider } from "@/context/NotificationContext";
// import NotificationListener from './components/NotificationListener.tsx';
createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
   {/* <NotificationProvider> */}
      {/* <NotificationListener /> */}
      <App />
    {/* </NotificationProvider> */}
  </GoogleOAuthProvider>
);
