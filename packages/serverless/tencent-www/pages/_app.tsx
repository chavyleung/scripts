import type { NextPage } from 'next'
import type { AppProps as NextAppProps } from 'next/app'
import { Application } from '../components/Application'

const App = ({ Component, pageProps }: AppProps) => {
  const getLayout = Component.getLayout || ((page) => page)
  return <Application>{getLayout(<Component {...pageProps} />)}</Application>
}

type AppProps = NextAppProps & {
  Component: NextPage
}

export default App
