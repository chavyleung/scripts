import Typography from '@mui/joy/Typography'
import { NextPage } from 'next'
import { MainLayout } from '../layouts/MainLayout'

const App: NextPage = () => {
  return (
    <>
      <Typography>Hello world!</Typography>
    </>
  )
}

App.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>
}

export default App
