import {
  grey600,
  pinkA100, pinkA200, pinkA400,
  redA400,
  purple900, deepPurple700,
  cyan500, cyan300, cyan100,
  lime500,
  fullWhite, white,
  fullBlack, black,
} from 'material-ui/styles/colors'
import {fade, darken, lighten} from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import React from 'react'


var lightPalette = {
  primary1Color: cyan500,
  primary2Color: cyan300,
  primary3Color: cyan100,
  accent1Color: cyan300,
  accent2Color: cyan300,
  accent3Color: cyan100,
  textColor: cyan500,
  secondaryTextColor: cyan500,
  alternateTextColor: white,
  canvasColor: white,
  borderColor: cyan300,
  disabledColor: fade(fullBlack, 0.3),
  pickerHeaderColor: cyan300,
  clockCircleColor: white,
}

var darkPalette = {
  primary1Color: white,
  primary2Color: cyan100,
  primary3Color: cyan300,
  accent1Color: cyan100,
  accent2Color: cyan100,
  accent3Color: cyan300,
  textColor: white,
  secondaryTextColor: white,
  alternateTextColor: cyan500,
  canvasColor: cyan500,
  borderColor: cyan300,
  disabledColor: fade(fullBlack, 0.3),
  pickerHeaderColor: white,
  clockCircleColor: cyan500,
}

var themeGen = (palette) => {
  return {
    spacing: spacing,
    fontFamily: 'Roboto, sans-serif',
    borderRadius: 2,
    palette: palette,
    // appBar: {
    //   color: 'transparent',
    // },
    bottomNavigation: {
      backgroundColor: palette.primary2Color,
      unselectedColor: fade(palette.alternateTextColor, 0.54),
      selectedColor: palette.alternateTextColor,
    },
    menu: {
      backgroundColor: palette.primary1Color,
      containerBackgroundColor: palette.primary1Color,
    },
    menuItem: {
      textColor: palette.alternateTextColor,
      hoverColor: fade(palette.alternateTextColor, 0.1),
      selectedTextColor: palette.accent1Color,
      rightIconDesktopFill: grey600,
    },
    menuSubheader: {
      color: palette.alternateTextColor,
      borderColor: palette.borderColor,
      textColor: palette.alternateTextColor,
    },
    raisedButton: {
      color: palette.primary2Color,
      textColor: palette.alternateTextColor,
    },
    tableRow: {
      hoverColor: palette.accent2Color,
      stripeColor: fade(lighten(palette.primary1Color, 0.5), 0.4),
      selectedColor: palette.borderColor,
      textColor: palette.textColor,
      selectedTextColor: palette.alternateTextColor,
      borderColor: palette.borderColor,
      height: 48,
    },
    toggle: {
      trackOffColor: fade(palette.primary3Color, 0.5),
    },
  }
}

const lightTheme = themeGen(lightPalette)
const darkTheme = themeGen(darkPalette)

const Theme = (props) => (
  <MuiThemeProvider muiTheme={getMuiTheme(props.theme)}>
    {props.children}
  </MuiThemeProvider>
)

export {lightTheme, darkTheme, Theme}
