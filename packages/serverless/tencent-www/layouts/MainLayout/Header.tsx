import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import MailRoundedIcon from '@mui/icons-material/MailRounded'
import MenuIcon from '@mui/icons-material/Menu'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import Box, { BoxProps } from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Stack, { StackProps } from '@mui/joy/Stack'
import { useColorScheme } from '@mui/joy/styles'
import TextField from '@mui/joy/TextField'
import Typography from '@mui/joy/Typography'

export const Header = () => {
  return (
    <Root>
      <Left />
      <Spacer />
      <Center />
      <Spacer />
      <Right />
    </Root>
  )
}

const Root = (props: StackProps) => {
  return (
    <Row
      {...props}
      sx={[
        {
          gap: 2,
          p: 2
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx])
      ]}
    />
  )
}

const Left = (props: BoxProps) => {
  return (
    <Row spacing={1.5}>
      <Box>
        <IconButton
          size="sm"
          variant="outlined"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <IconButton
          size="sm"
          variant="solid"
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          <MailRoundedIcon />
        </IconButton>
      </Box>

      <Typography component="h1" fontWeight="xl">
        BoxJs
      </Typography>
    </Row>
  )
}

const Center = (props: BoxProps) => {
  return (
    <>
      <TextField
        size="sm"
        sx={(theme) => ({
          [`& .JoyInput-root`]: {
            backgroundColor: theme.palette.neutral.softBg
          }
        })}
        variant="outlined"
        placeholder="Search anything…"
        startDecorator={<SearchRoundedIcon color="primary" />}
        endDecorator={
          <IconButton variant="soft" size="sm" color="neutral">
            <Typography
              fontWeight="lg"
              fontSize="sm"
              textColor={(theme) => theme.palette.text.tertiary}
            >
              /
            </Typography>
          </IconButton>
        }
      />
    </>
  )
}

const Right = (props: BoxProps) => {
  return (
    <>
      <Row spacing={1.5}>
        <ColorSchemeSwitcher />
      </Row>
    </>
  )
}

const Row = (props: StackProps) => (
  <Stack
    direction="row"
    {...props}
    sx={[
      {
        alignItems: 'center',
        justifyContent: 'flex-start'
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx])
    ]}
  />
)

const Spacer = (props: BoxProps) => (
  <Box
    {...props}
    sx={[{ flex: 1 }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
  />
)

const ColorSchemeSwitcher = () => {
  const { mode, setMode } = useColorScheme()

  return (
    <IconButton
      size="sm"
      variant="outlined"
      color="primary"
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light')
      }}
    >
      {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  )
}
