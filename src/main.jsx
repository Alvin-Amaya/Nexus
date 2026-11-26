import 'nes.css/css/nes.min.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './ui/app'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);