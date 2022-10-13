import Box, { BoxProps } from '@mui/joy/Box'
import { Header } from './Header'
import { Navigation } from './Navigation'

export const MainLayout = () => {
  return (
    <Root
      sx={{
        display: 'grid',
        minHeight: '100vh',
        gridTemplateRows: '64px 1fr',
        gridTemplateColumns: '220px 1fr',
        gridTemplateAreas: `
          "header header"
          "navigation main"
        `
      }}
    >
      <HeaderRoot children={<Header />} />
      <NavigationRoot children={<Navigation />} />
      <MainRoot children={<></>} />
    </Root>
  )
}

const Root = (props: BoxProps) => {
  return <Box {...props} />
}

const HeaderRoot = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[
        {
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 2,
          gridArea: 'header',
          p: 2,
          position: 'sticky'
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx])
      ]}
    />
  )
}

const NavigationRoot = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[
        {
          borderRight: '1px solid',
          borderColor: 'divider',
          gridArea: 'navigation',
          p: 2
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx])
      ]}
    />
  )
}

const MainRoot = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[
        {
          gridArea: 'main',
          p: 2
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx])
      ]}
    />
  )
}
