import React from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Paper,
  Typography
} from '@material-ui/core';
import {
  withStyles
} from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
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
    padding: theme.spacing(3)
  },
  hiddenFileInput: {
    display: 'none'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center",
    height: "100vh"
  }
})

export default class PDFMergePage extends React.Component {
  state = {
    files: [
      // {
      //   id: 0,
      //   selected: false,
      //   chosen: false,
      //   filtered: false,
      //   data: new File(['abc'], 'test.pdf')
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
    return (
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
            />
          </Grid>
        ))}
      </ReactSortable>
    );
  }
  
  render() {
    const { classes } = this.props;
    return (
      <Page title='PDF Merge'>
        {
          this.state.isLoading ? (
            <div className={classes.loaderContainer}>
              <CircularProgress/>
            </div>
          ) : (
            <div className={classes.container}>
              <Grid container spacing={3}>
                <Grid item xs={12} container justify='center'>
                  <Grid item xs={12} container justify='center'>
                    <Typography variant='h2'>
                      PDF Merge
                    </Typography>
                  </Grid>
                  <Grid item xs={12} container justify='center'>
                    <Typography variant='h6'>
                      Powered by <a className='hidden-link hover-link' href='https://www.pumoso.com'>Pumoso</a>
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
                    <Typography variant='subtitle2'>
                      We never have access to your files and their contents.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </div>
          )
        }
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
    margin: '2px',
    cursor: 'grab'
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
    if (this.state.isHovering) {
      return (
        <IconButton
          className={classes.removeButton}
          onClick={() => this.props.removeFile(this.props.fileIndex)}
        >
          <RemoveCircleIcon/>
        </IconButton>
      );
    }
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
        <Grid container spacing={2} justify='space-between'>
          <Grid
            item 
            xs={11}
            container
            spacing={1}
            alignItems='center'
            className={classes.fileTextContainer}
          >
            <Grid item className={classes.fileNameContainer}>
              <Typography className={classes.fileName}>
                {file.name}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='caption' className={classes.fileSize}>
                {this.getFileSizeText()}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            {this.renderRemoveButton()}
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

FileCard = withStyles(fileCardStyles)(FileCard);
