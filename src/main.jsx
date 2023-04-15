import React from 'react'
import ReactDOM from 'react-dom/client'

import { Button } from 'flowbite-react'

import '@/site.css'
import ButtonTheme from '@/components/ButtonTheme'

function App () {
  return (
    <div className='p-4'>
      IT WORKS <ButtonTheme />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
