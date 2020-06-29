import React from 'react';
import {
  CssBaseline
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AppContainer from 'app/components/AppContainer/AppContainer';
import PDFMergePage from 'app/pages/PDFMergePage/PDFMergePage';


const appStyles = (theme) => ({
  appContainer: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

class Main extends React.Component {
  render () {
    return (
      <>
        <CssBaseline/>
        <AppContainer>
          <PDFMergePage/>
        </AppContainer>
      </>
    )
  }
}

Main = withStyles(appStyles)(Main);
export default Main;
