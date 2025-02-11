import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { router } from './routing'
import { antdTheme } from './theme'
import store from '../shared/store'

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ConfigProvider>
  )
}

export default App
