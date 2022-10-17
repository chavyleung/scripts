import Box, { BoxProps } from '@mui/joy/Box'
import { PropsWithChildren } from 'react'
import { Header } from './Header'
import { Navigation } from './Navigation'

export const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <Root
      sx={{
        display: 'grid',
        minHeight: '100vh',
        gridTemplateRows: '64px 1fr',
        gridTemplateColumns: {
          xs: '1fr',
          md: '220px 1fr'
        },
        gridTemplateAreas: {
          xs: `
            "header"
            "main"
          `,
          md: `
            "header header"
            "navigation main"
          `
        }
      }}
    >
      <HeaderRoot children={<Header />} />
      <NavigationRoot children={<Navigation />} />
      <MainRoot children={children} />
    </Root>
  )
}

const Root = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[{}, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
  )
}

const HeaderRoot = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[
        {
          borderBottom: '1px solid',
          borderColor: 'divider',
          gridArea: 'header',
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
          display: {
            xs: 'none',
            md: 'initial'
          },
          borderRight: '1px solid',
          borderColor: 'divider',
          gridArea: 'navigation'
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
