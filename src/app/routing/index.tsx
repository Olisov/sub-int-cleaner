import { createBrowserRouter } from 'react-router-dom'
import { CommandGenPage } from '../../pages/command-gen-page'

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <CommandGenPage />
      }
    ]
  }
])
