import React from 'react';
import {
  Box,
  Container
} from '@material-ui/core';


class AppContainer extends React.Component {
  render () {
    return (
      <>
        <Box>
          <Container>
            {this.props.children}
          </Container>
        </Box>
      </>
    );
  }
};

export default AppContainer;