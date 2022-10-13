import Box, { BoxProps } from '@mui/joy/Box'

export const Navigation = () => {
  return <Root></Root>
}

const Root = (props: BoxProps) => {
  return (
    <Box
      {...props}
      sx={[{}, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
  )
}
