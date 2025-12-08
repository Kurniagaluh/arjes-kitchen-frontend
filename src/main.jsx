import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Import React Query (Hanya Client & Provider saja, Devtools dihapus)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'

// Buat instance client untuk React Query
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bungkus Aplikasi dengan React Query Provider */}
    <QueryClientProvider client={queryClient}>
      
      {/* Bungkus Aplikasi dengan Router */}
      <BrowserRouter>
        
        {/* Bungkus Aplikasi dengan Cart Provider (Global State Keranjang) */}
        <CartProvider>
          <App />
        </CartProvider>
        
      </BrowserRouter>

      {/* Devtools dihapus agar tampilan bersih */}
      
    </QueryClientProvider>
  </React.StrictMode>,
)