import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.title = "My React App";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
            <App />
        </div>
        
    </StrictMode>,
)
