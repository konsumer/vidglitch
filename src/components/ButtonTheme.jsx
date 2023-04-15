import { useState } from 'react'
import { IconMoonFilled, IconSunFilled } from '@tabler/icons-react'

export default function ButtonTheme () {
  const [dark, setDark] = useState(localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches))

  const handleClick = () => {
    localStorage.setItem('color-theme', dark ? 'light' : 'dark')
    if (dark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    setDark(!dark)
  }

  return (
    <button
      type='button'
      className='text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm p-2.5'
      onClick={handleClick}
    >
      {dark ? <IconMoonFilled /> : <IconSunFilled />}
    </button>
  )
}
