import Box, { BoxProps } from '@mui/joy/Box'
import List from '@mui/joy/List'

export const Navigation = () => {
  return (
    <Root>
      <List size="sm"></List>
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
