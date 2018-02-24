import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Paper from 'material-ui/Paper';
import _ from 'lodash';
import Button from 'material-ui/Button';
import { getReportNarrativeFromID } from '../../../actions/reportActions';
import styles from './QuillEditorStyles';
import './NarrativeAnnotator.css';

class QuillEditor extends Component {
  static propTypes = {
    getReportNarrativeFromID: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      pdfView: PropTypes.string,
      editorWindow: PropTypes.string,
      paperWindow: PropTypes.string,
      root: PropTypes.string,
      wrapper: PropTypes.string,
      buttonSuccess: PropTypes.string,
      buttonProgress: PropTypes.string,
    }).isRequired,
    primaryid: PropTypes.number,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
  }

  static defaultProps = {
    match: {},
    primaryid: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      current: {
        reportText: '',
        tags: [],
      },
      saved: {
        reportText: '',
        tags: [],
      },
    };
  }

  componentWillMount() {
    if (this.props.match.params) {
      this.getTextFromID(Number(this.props.match.params.id, 10));
    } else {
      this.getTextFromID(this.props.primaryid);
    }
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.onUnload);
    this.autosave = setInterval(() => this.saveWork(), 10000);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onUnload);
    clearInterval(this.autosave);
  }

  onUnload = () => this.saveWork();

  getTextFromID = (id) => {
    if (isNaN(id)) {
      this.setState({
        saving: true,
        success: false,
        loading: false,
      });
    } else {
      this.props.getReportNarrativeFromID(id)
        .then((rows) => {
          if (rows.length > 0) {
            this.setState({
              saving: false,
              success: true,
              loading: false,
              current: {
                reportText: rows[0].report_text,
                tags: rows[0].tags,
              },
              saved: {
                reportText: rows[0].report_text,
                tags: rows[0].tags,
              },
            });
          } else {
            this.setState({
              saving: true,
              success: false,
              loading: false,
            });
          }
        });
    }
  }

  saveWork = () => {
    if (!this.state.saving && !_.isEqual(this.state.current, this.state.saved)) {
      this.setState({
        success: false,
        saving: true,
      });

      const fetchData = {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: this.state.current.reportText,
          tags: this.state.current.tags,
          primaryid: (this.props.match.params)
            ? Number(this.props.match.params.id, 10)
            : this.props.primaryid,
        }),
      };

      fetch('http://localhost:3001/savereporttext', fetchData)
        .then(() => {
          this.setState({
            saved: this.state.current,
            success: true,
            saving: false,
          });
        })
        .catch(err => console.log(err));
    }
  }

  handleChange = (value) => {
    const greenRe = 'background-color: chartreuse;';
    const blueRe = 'background-color: cadetblue;';
    const orangeRe = 'background-color: darkorange;';
    const yellowRe = 'background-color: gold;';
    const pinkRe = 'background-color: lightpink;';
    const purpleRe = 'background-color: orchid;';
    const silverRe = 'background-color: silver;';
    const cyanRe = 'background-color: cyan;';
    const newTags = {};

    const spans = document.getElementById('react-quill')
      .getElementsByClassName('ql-editor')[0]
      .getElementsByTagName('span');

    for (let i = 0; i < spans.length; i += 1) {
      switch (spans[i].getAttribute('style')) {
        case greenRe:
          newTags.greenTag = (newTags.greenTag)
            ? newTags.greenTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case blueRe:
          newTags.blueTag = (newTags.blueTag)
            ? newTags.blueTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case orangeRe:
          newTags.orangeTag = (newTags.orangeTag)
            ? newTags.orangeTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case yellowRe:
          newTags.yellowTag = (newTags.yellowTag)
            ? newTags.yellowTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case pinkRe:
          newTags.pinkTag = (newTags.pinkTag)
            ? newTags.pinkTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case purpleRe:
          newTags.purpleTag = (newTags.purpleTag)
            ? newTags.purpleTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case silverRe:
          newTags.silverTag = (newTags.silverTag)
            ? newTags.silverTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        case cyanRe:
          newTags.cyanTag = (newTags.cyanTag)
            ? newTags.cyanTag.concat(spans[i].innerText)
            : [spans[i].innerText];
          break;
        default:
      }
    }
    this.setState({ success: false, current: { reportText: value, tags: newTags } });
  }

  colorBackground(color) {
    const { index, length } = this.quill.getSelection();
    this.quill.formatText(index, length, 'background', color);
  }

  customToolbar = () => (
    <div id="quill-toolbar" style={{ padding: '4px' }}>
      <Button className="ql-colorBackground" value="chartreuse" style={{ padding: '0px', margin: '4px', background: 'chartreuse' }}>
        Drug
      </Button>
      <Button className="ql-colorBackground" value="cyan" style={{ padding: '0px', margin: '4px', background: 'cyan' }}>
        Adverse Reaction
      </Button>
      <Button className="ql-colorBackground" value="darkorange" style={{ padding: '0px', margin: '4px', background: 'darkorange' }}>
        Dosage
      </Button>
      <Button className="ql-colorBackground" value="gold" style={{ padding: '0px', margin: '4px', background: 'gold' }}>
        Age
      </Button>
      <Button className="ql-colorBackground" value="lightpink" style={{ padding: '0px', margin: '4px', background: 'lightpink' }}>
        Gender
      </Button>
      <Button className="ql-colorBackground" value="orchid" style={{ padding: '0px', margin: '4px', background: 'orchid' }}>
        Weight
      </Button>
      <Button className="ql-colorBackground" value="silver" style={{ padding: '0px', margin: '4px', background: 'silver' }}>
        Indication
      </Button>
      <Button className="ql-colorBackground" value="" style={{ padding: '0px', margin: '4px' }}>
        Clear
      </Button>
      <Button className="ql-colorBackground pull-right" value="cadetblue" style={{ padding: '0px', margin: '4px', background: 'cadetblue' }}>
        Interesting
      </Button>
    </div>
  )

  modules = {
    toolbar: {
      container: '#quill-toolbar',
      handlers: {
        colorBackground: this.colorBackground,
      },
    },
    history: {
      delay: 500,
      maxStack: 500,
      userOnly: true,
    },
  };

  render() {
    return (
      <div className={`${this.props.classes.pdfView} container`}>
        {/* ====== Quil editor for Annotating the Report Text ====== */}
        <Paper elevation={4} className={this.props.classes.paperWindow}>
          {this.customToolbar()}
          {
            (!this.state.loading)
              ? <ReactQuill
                id={'react-quill'}
                value={this.state.current.reportText}
                onChange={this.handleChange}
                modules={this.modules}
                theme="snow"
              />
              : null
          }
        </Paper>

        {/* ====== Save Button Area ====== */}
        <div className={this.props.classes.wrapper}>
          <Button
            raised
            color="primary"
            className={(this.state.success) ? this.props.classes.buttonSuccess : ''}
            disabled={this.state.saving}
            onClick={this.saveWork}
          >
            Save
          </Button>
          {this.state.saving &&
            <CircularProgress
              size={24}
              className={this.props.classes.buttonProgress}
            />}
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { getReportNarrativeFromID },
)(withStyles(styles)(QuillEditor));
