import { CssVarsProvider, Theme } from '@mui/joy/styles'
import { GlobalStyles } from '@mui/system'
import { PropsWithChildren } from 'react'

export const Application = ({ children }: PropsWithChildren) => {
  return <ApplicationStyle>{children}</ApplicationStyle>
}

const ApplicationStyle = ({ children }: PropsWithChildren) => {
  return (
    <CssVarsProvider>
      <GlobalStyles<Theme>
        styles={(theme) => ({
          body: {
            margin: 0,
            fontFamily: theme.vars.fontFamily.body
          }
        })}
      />
      {children}
    </CssVarsProvider>
  )
}
