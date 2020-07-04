import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  CircularProgress,
  Paper,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  withStyles
} from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import MergeTypeIcon from '@material-ui/icons/MergeType';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import { ReactSortable } from 'react-sortablejs';
import pdf from 'pdfjs';
import download from 'downloadjs';
import Page from 'app/components/Page/Page';
import worker from 'workerize-loader!app/PDFMergeWorker'; // eslint-disable-line import/no-webpack-loader-syntax


const homePageStyles = theme => ({
  container: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5)
  },
  pageContainer: {
    minHeight: '100vh'
  },
  hiddenFileInput: {
    display: 'none'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center",
    height: "100vh"
  },
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  paper: {
    paddingBottom: 50,
  },
  filePlaceholderContainer: {
    padding: theme.spacing(2),
    boxShadow: 'none',
    border: '1px solid #d3d3d38a',
    width: '500px',
    maxWidth: '100%',
  },
  list: {
    marginBottom: theme.spacing(2),
  },
  subheader: {
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    top: 'auto',
    bottom: 0,
    backgroundColor: 'rgb(25,25,25)',
    borderTop: '1px solid #d3d3d38a',
  },
  appBarButton: {
    color: 'white',
    '&:disabled': {
      color: 'rgba(255,255,255,0.2)'
    }
  },
  grow: {
    flexGrow: 1,
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto',
    color: 'white',
    backgroundColor: 'black',
  },
})

export default class PDFMergePage extends React.Component {
  state = {
    files: [
      // {
      //   id: 0,
      //   selected: false,
      //   chosen: false,
      //   filtered: false,
      //   data: new File(['abc'], 'testasdfasdfasdfasdfasdfadsfasdfasdfa.pdf')
      // }
    ],
    isLoading: false
  }

  downloadPdf = pdf => {
    download(pdf, 'merged.pdf', 'application/pdf');
  };

  handleMerge = async () => {
    this.setState({ isLoading: true });
    if (window.Worker) {
      const workerInstance = worker();
      const mergedPdf = await workerInstance.mergePdfs(this.state.files);
      this.downloadPdf(mergedPdf);
      this.setState({ isLoading: false });
    } else {
      const doc = new pdf.Document();
      for (const file of this.state.files) {
        const src = await new Response(file.data).arrayBuffer();
        const ext = new pdf.ExternalDocument(src);
        doc.addPagesOf(ext);
      }
      const buffer = await doc.asBuffer();
      const mergedFile = new Blob([buffer], {type: 'application/pdf'});
      this.downloadPdf(mergedFile);
      this.setState({ isLoading: false });
    }
  }

  handleFileUpload = async (event) => {
    const files = [ ...this.state.files ];
    const newFileData = Array.from(event.target.files);
    event.target.value = null;
    newFileData.forEach(file => {
      files.push({
        id: files.length,
        selected: false,
        chosen: false,
        filtered: false,
        data: file
      });
    })
    this.setState({ files });
  }

  removeFile = (index) => {
    const files = this.state.files.slice(0);
    files.splice(index, 1);
    this.setState({ files });
  }

  renderFileItems = () => {
    const { classes } = this.props;
    return this.state.files.length ? (
      <ReactSortable
        list={this.state.files}
        setList={updatedFiles => this.setState({ files: updatedFiles })}
      >
        {this.state.files.map((file, index) => (
          <Grid key={index} container justify='center'>
            <FileCard
              file={file.data}
              fileIndex={index}
              removeFile={this.removeFile}
              small={this.props.windowWidth < 600}
            />
          </Grid>
        ))}
      </ReactSortable>
    ) : (
      <Grid container justify='center'>
        <Paper className={classes.filePlaceholderContainer}>
          <Typography variant='subtitle2' align='center'>
            No files selected. Add files to begin merging.
          </Typography>
        </Paper>
      </Grid>
    );
  }

  renderDesktopContent = () => {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12} container justify='center'>
            <Grid item xs={12} container justify='center'>
              <Typography variant='h3' align='center'>
                PDF MERGE
              </Typography>
            </Grid>
            <Grid item xs={12} container justify='center'>
              <Typography variant='h6' align='center'>
                By <a className='hidden-link hover-link' href='https://www.pumoso.com'>Pumoso</a>
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {this.renderFileItems()}
          </Grid>
          <Grid item xs={12} container justify='center' spacing={2}>
            <Grid item>
              <input 
                accept=".pdf" 
                className={classes.hiddenFileInput}
                id="raised-button-file" 
                multiple 
                type="file"
                onChange={this.handleFileUpload}
              /> 
              <label htmlFor="raised-button-file"> 
                <Button
                  disabled={this.state.isLoading}
                  variant="contained"
                  className={classes.button}
                  startIcon={<AddIcon />}
                  component='span'
                >
                  Add
                </Button>
              </label> 
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disabled={!this.state.files.length || this.state.isLoading}
                className={classes.button}
                onClick={() => this.setState({ files: [] })}
                startIcon={<ClearAllIcon />}
              >
                Clear
              </Button>
            </Grid>
            <Grid item>
              <div className={classes.wrapper}>
                <Button
                  variant="contained"
                  disabled={!this.state.files.length || this.state.isLoading}
                  className={classes.button}
                  onClick={this.handleMerge}
                  startIcon={<MergeTypeIcon />}
                >
                  Merge
                </Button>
              </div>
            </Grid>
          </Grid>
          <Grid item xs={12} container justify='center'>
            <Box fontStyle='italic'>
              <Typography variant='subtitle2' align='center'>
                Your files are only accessible to you and are never sent through the network.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </div>
    );
  }

  renderMobileContent = () => {
    const { classes } = this.props;
    return (
      <>
        <Grid container direction='column' className={classes.pageContainer}>
          <Grid item xs>
            <div className={classes.container}>
              <Grid container spacing={3}>
                <Grid item xs={12} container justify='center'>
                  <Grid item xs={12} container justify='center'>
                    <Typography variant='h3' align='center'>
                      PDF MERGE
                    </Typography>
                  </Grid>
                  <Grid item xs={12} container justify='center'>
                    <Typography variant='h6' align='center'>
                      By <a className='hidden-link hover-link' href='https://www.pumoso.com'>Pumoso</a>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  {this.renderFileItems()}
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item>
            <div className={classes.toolbarOffset}>
              <Box fontStyle='italic' pb={2}>
                <Typography variant='subtitle2' align='center' gutterBottom>
                  Your files are only accessible to you and are never sent through the network.
                </Typography>
              </Box>
              <Toolbar/>
            </div>
          </Grid>
        </Grid>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Grid container spacing={2} justify='space-around'>
              <Grid item>
                <IconButton
                  disabled={!this.state.files.length || this.state.isLoading}
                  onClick={() => this.setState({ files: [] })}
                  className={classes.appBarButton}
                >
                  <ClearAllIcon fontSize='large'/>
                </IconButton>
              </Grid>
              <Grid item>
                <input 
                  accept=".pdf" 
                  className={classes.hiddenFileInput}
                  id="raised-button-file" 
                  multiple 
                  type="file"
                  onChange={this.handleFileUpload}
                /> 
                <label htmlFor="raised-button-file">
                  <IconButton
                    disabled={this.state.isLoading}
                    component='span'
                    className={classes.appBarButton}
                  >
                    <AddBoxOutlinedIcon fontSize='large'/>
                  </IconButton>
                </label>
              </Grid>
              <Grid item>
                <IconButton
                  disabled={!this.state.files.length || this.state.isLoading}
                  onClick={this.handleMerge}
                  className={classes.appBarButton}
                >
                  <MergeTypeIcon fontSize='large'/>
                </IconButton>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </>
    );
  }
  
  render() {
    const { classes } = this.props;
    return (
      <Page title='PDF MERGE'>
        <Container>
          {
            this.state.isLoading ? (
              <div className={classes.loaderContainer}>
                <CircularProgress/>
              </div>
            ) : (
              this.props.windowWidth < 600 ? (
                this.renderMobileContent()
              ) : (
                this.renderDesktopContent()
              )
            )
          }
        </Container>
      </Page>
    );
  }
};

PDFMergePage = withStyles(homePageStyles)(PDFMergePage);

const fileCardStyles = theme => ({
  paper: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    boxShadow: 'none',
    border: '1px solid #d3d3d38a',
    position: 'relative',
    width: '500px',
    maxWidth: '100%',
    margin: '2px',
    cursor: 'grab',
    '&:hover': {
      boxShadow: '0px 0px 5px lightgrey'
    }
  },
  fileName: {
    whiteSpace: 'nowrap',
    width: '100%',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  fileNameContainer: {
    maxWidth: '80%'
  },
  fileSize: {
    color: 'gray',
  },
  fileTextContainer: {
    maxWidth: 'calc(100% - 32px)'
  },
  removeButton: {
    padding: 0,
    '&:hover': {
      opacity: '70%',
      cursor: 'pointer'
    }
  },
})

class FileCard extends React.Component {
  state = {
    isHovering: false
  };

  handleMouseEnter = () => {
    this.setState({ isHovering: true });
  }

  handleMouseLeave = () => {
    this.setState({ isHovering: false });
  }

  renderRemoveButton = () => {
    const { classes } = this.props;
    return (
      <IconButton
        className={classes.removeButton}
        onClick={() => this.props.removeFile(this.props.fileIndex)}
      >
        <RemoveCircleIcon/>
      </IconButton>
    );
  }

  getFileSizeText = () => {
    const fileSize = this.props.file.size;
    if (fileSize >= 1000000) {
      return `${(fileSize / 1000000).toFixed(2)} MB`;
    } else if (fileSize >= 1000) {
      return `${(fileSize / 1000).toFixed(2)} KB`; 
    } else {
      return `${fileSize} B`;
    }
  }

  render () {
    const { classes, file } = this.props;
    return (
      <Paper
        className={classes.paper}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <Grid container spacing={2} alignItems='center'>
          <Grid
            item
            container
            spacing={1}
            alignItems='center'
            className={classes.fileTextContainer}
          >
            <Grid item xs zeroMinWidth>
              <Typography noWrap>
                {file.name}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='caption' className={classes.fileSize}>
                {this.getFileSizeText()}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs container justify='flex-end' alignItems='center'>
            {this.renderRemoveButton()}
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

FileCard = withStyles(fileCardStyles)(FileCard);
