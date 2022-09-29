import { CssVarsProvider, extendTheme } from '@mui/joy/styles'
import Typography from '@mui/joy/Typography'

const App = () => {
  const theme = extendTheme({})
  return (
    <>
      <CssVarsProvider theme={theme}>
        <Typography>Hello world!</Typography>
      </CssVarsProvider>
    </>
  )
}

export default App
