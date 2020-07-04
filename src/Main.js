import React from 'react';
import {
  CssBaseline
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
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
  state = {
    width: 0
  };

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({
      width: window.innerWidth,
    });
  }

  render () {
    return (
      <>
        <CssBaseline/>
        <PDFMergePage windowWidth={this.state.width}/>
      </>
    )
  }
}

Main = withStyles(appStyles)(Main);
export default Main;
