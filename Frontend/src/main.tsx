import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './app/App.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(<App />)

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nouvelle version disponible.')
  },
  onOfflineReady() {
    console.log('Application prete pour le mode hors ligne.')
  },
})
