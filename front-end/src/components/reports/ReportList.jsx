import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import { blue, green, red, yellow } from '@material-ui/core/colors';
import TextField from '@material-ui/core/TextField';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Tabs, { Tab } from '@material-ui/core/Tabs';
import Snackbar from '@material-ui/core/Snackbar';
import MaterialTooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import ReportTable from './components/ReportTable';
import CaseSummaryListing from './components/CaseSummaryListing';
import ReportPanel from './components/ReportPanel';
import MEVColors from '../../theme';
import { getUserCases, createUserBin, getCountData } from '../../actions/reportActions';
import CaseIcon from '../../resources/CaseIcon';
import ReadCaseIcon from '../../resources/ReadCaseIcon';
import NewCaseIcon from '../../resources/NewCaseIcon';
import TrashIcon from '../../resources/TrashIcon';
import AllReportsIcon from '../../resources/AllReportsIcon';
import GoToVisualizationIcon from '../../resources/goToVisualizationIcon.svg';
import ViewCaseSummary from '../../resources/caseSummary.svg';
import styles from './ReportListStyles';
//import {getEntireTimeline, setSelectedDate} from '../../actions/timelineActions';



const defaultTheme = createMuiTheme({
  palette: {
    primary: {
      ...blue,
      500: MEVColors.buttonLight,
      700: MEVColors.buttonHover,
    },
    secondary: {
      ...green,
    },
    ...MEVColors,
    error: red,
  },
  shadows: ["none"],
  borderRadius: 0
});

/**
 * This is the component for the Report page
 */
class ReportList extends Component {
  static propTypes = {
    getUserCases: PropTypes.func.isRequired,
    createUserBin: PropTypes.func.isRequired,
    userID: PropTypes.number.isRequired,
    userEmail: PropTypes.string,
    isLoggedIn: PropTypes.bool.isRequired,
    getCountData: PropTypes.func.isRequired,
    classes: PropTypes.shape({
      newCaseArea: PropTypes.string,
      goToVisualizationSVG: PropTypes.string,
      caseSummarySVG: PropTypes.string,
      tooltipStyle: PropTypes.string,
      ReportList: PropTypes.string,
      newCaseModal: PropTypes.string,
      closedSummaryTableContainer: PropTypes.string,
      closedSummaryContainer: PropTypes.string,
      openSummaryTableContainer: PropTypes.string,
      openSummaryContainer: PropTypes.string,
    }).isRequired,
  };

    constructor() {
    super();
    this.handleCaseChangePrimary = this.handleCaseChangePrimary.bind(this);
    this.state = {
      bin: 'all reports',
      userBins: [],
      newCaseModalOpen: false,
      snackbarOpen: false,
      primaryIDReport: 0,
        currentlyFilteredDateRange: '03/24/2017 - 03/31/2017',
      snackbarMessage: '',
      currentTab: 0,
      summaryOpen: false,
      textOpen: true,
      reportOpen: false,
      primaryChosen: false,
      supportiveChosen: false,
      summaryCounter: 0,
      returnedResults: [],
      returnedIds: [],
      searchLoading: false,
    };
    //handleCaseChangePrimary = handleCaseChangePrimary.bind(this);
  }

  getCount = () => {

      this.props.getCountData();

  };


  componentWillMount() {
    if (!this.props.isLoggedIn) {
      window.location = '/';

    }
    this.getBins();
    this.getCount()
  }

  /**
   * Retrieves the names of the bins the user has created
   */
  getBins = () => {
    this.props.getUserCases(this.props.userID)
      .then((bins) => {
        if (bins) {
          this.setState({
            userBins: [{ name: 'All Reports', case_id: -1 }].concat(bins.filter(bin => bin.active)
              .map(bin => ({ name: this.toTitleCase(bin.name), case_id: bin.case_id }))),
          });
        }
      });
  };

   updateTab = (name, color) => {
    const userCreatedArray = this.state.userBins.map(bin => bin.name.toLowerCase()).filter(bin => (bin !== 'trash' && bin !== 'read' && bin !== 'all reports' && bin !== 'new case' && bin !== 'searched reports'));
    const array = ['all reports', 'searched reports', 'read', 'trash', 'new case'].concat(userCreatedArray);
    const index = array.indexOf(name);
    this.setState({
      bin: name,
      //background: color,
      currentTab: index,
      returnedResults: this.props.returnedResults,
    });
  };



    updateColor = (name, color) => {
        const userCreatedArray = this.state.userBins.map(bin => bin.name.toLowerCase()).filter(bin => (bin !== 'trash' && bin !== 'read' && bin !== 'all reports' && bin !== 'new case' && bin !== 'searched reports'));
        const array = ['all reports', 'searched reports', 'read', 'trash', 'new case'].concat(userCreatedArray);
        const index = array.indexOf(name);
        this.setState({
            bin: name,
            //background: color,
            currentTab: index,
            returnedResults: this.props.returnedResults,

        });
    };



  /**
   * Changes the first letter of any word in a string to be capital
   */
  toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  changeTab = (currentTab) => {
      if (currentTab === 1) {  // This is the searched tab
          //***************  Searched reports can be accessed */
          this.setState({currentTab});

      }
  };

  printSearchResults = (arr1,arr2) => {
    /* propagated */
    this.setState({
      returnedResults: arr1,
      returnedIds: arr2,
      searchLoading: false,
    });
  };




  /**
   * Handler for Tab bar clicks
   */
  handleTabClick = (event, currentTab) => {
    // If the Current tab is the New Case tab, open the Modal
    if (currentTab === 4) {
      this.setState({
        currentTab,
        newCaseModalOpen: true,
      });
    } else if (currentTab === 1) {  // This is the searched tab
      //***************  Searched reports can be accessed */
        if(this.state.returnedResults.length > 0){
          this.setState({ currentTab, bin: 'searched reports'})
        }

    } else {
      this.setState({
        currentTab,
        bin: event.currentTarget.getAttribute('name').toLowerCase(),
      });
    }
  };

  /**
   * Handler to close the SnackBar
   */
  handleCloseSnackbar = () => {
    this.setState({ snackbarOpen: false });
  };

  /**
   * Handler for Opening the New Case Modal
   */
  handleNewCaseOpen = () => {
    this.setState({ newCaseModalOpen: true });
  };

    handleSupportChosen = () => {
        this.setState({ supportiveChosen: !this.state.supportiveChosen });
    };

    handlePrimaryChosen = () => {
        this.setState({ primaryChosen: !this.state.primaryChosen });
    };

  /* Collapse report panel */
  handleHideReport = () => {
    if (this.state.summaryOpen){
      return this.setState({ textOpen: !this.state.textOpen});
    }
    else {
      return this.setState({ summaryOpen: !this.state.summaryOpen});
    }
  };

  /**
   * Handler for Opening the New Case Modal
   */
  handleViewCaseSummary = () => {
    if(this.state.textOpen){
      return this.setState({ summaryOpen: !this.state.summaryOpen});
    }
    else {
      return this.setState({ textOpen: !this.state.textOpen});
    }
  };
    /**
     * Handler for Opening the Report Panel
     */
    handleViewReportPanel = (primaryID) => {

        this.setState({ reportOpen: !this.state.reportOpen,  primaryIDReport: Number(primaryID) });
    };

  /**
   * Handler for Closing the New Case Modal
   */
  handleNewCaseClose = () => {
    this.setState({
      newCaseModalOpen: false,
      // Set back to the All Reports Tab
      currentTab: 0,
      bin: 'all reports',
    });
  };
    COLORS = {
        supportive: '#0CC8E8',
        primary: '#0CE88E',
        selected: '#ffff00'
    };
    //CHANGED HERE. WILL BE USED WITH THE PIE CHART FOR IMPLEMENTATION.
    handleCaseChangePrimary = (color, caseName) => {

        switch (color) {

            case this.COLORS.primary:
                console.log("Primary " + this.COLORS.primary);
                this.setState (
                    {
                        primaryChosen: true,
                        supportiveChosen: false
                    }
                );
                console.log("Primary chosen in Case " + this.state.primaryChosen);
                this.updateTab(caseName, color);
                break;
            case this.COLORS.supportive:
                console.log("Supportive " + this.COLORS.supportive);
                this.setState(
                    {
                        primaryChosen: false,
                        supportiveChosen: true
                    }
                );
                console.log("Supportive chosen in Case " + this.state.supportiveChosen);
                this.updateTab(caseName, color);
                break;
            default:
                return null;

        }

    };

  calculateSummarySize = () => {
    if(this.state.summaryOpen){
      if(this.state.textOpen){
        return this.props.classes.smallSummaryContainer;
      }
      else{
        return this.props.classes.largeSummaryContainer;
      }
    }
    else {
      return this.props.classes.closedSummaryContainer;
    }
  };

  calculateReportSize = () => {
    if(this.state.textOpen){
      if(this.state.summaryOpen){
        return this.props.classes.smallReportContainer;
      }
      else{
        return this.props.classes.largeReportContainer;
      }
    }
    else {
      return this.props.classes.closedReportContainer;
    }
  };

  setSearchLoading = (bool) => {
    this.setState({
      searchLoading: bool,
    });
  }

  /**
   * Checks name validity of new bin and shows an error or sends a backend fetch request
   */
  handleNewCaseClick = () => {
    const binName = document.getElementById('newCaseName').value.toLowerCase().trim();
    const binDesc = document.getElementById('newCaseDesc').value.trim();
    if (binName !== '' && !(this.state.userBins.filter(bin => bin.name.toLowerCase() === binName).length)) {
      this.props.createUserBin(this.props.userID, binName, binDesc)
        .then((newCaseID) => {
          this.setState({
            snackbarOpen: true,
            snackbarMessage: `Case ${this.toTitleCase(binName)} Created!`,
            userBins: this.state.userBins.concat({
              name: this.toTitleCase(binName), case_id: newCaseID,
            }),
          });
          document.getElementById('newCaseName').value = '';
          document.getElementById('newCaseDesc').value = '';
          this.handleNewCaseClose();
        });
    } else {
      this.setState({ snackbarOpen: true, snackbarMessage: 'Error! Invalid Case Name' });
    }
  };

  updateSummary = () => {
    this.setState({ summaryCounter: this.state.summaryCounter + 1 });
  };

  render() {
    // console.log(this.state.searchedReports)
    return (
      <MuiThemeProvider theme={defaultTheme} >
        <div className={this.props.classes.ReportList} >
          {/* ====== Top Bar with Tabs for each Case ====== */}
          <AppBar position="static" color="default" className={this.props.classes.borderBottom}>
            <Tabs
              style={{height: '72px'}}
              value={this.state.currentTab}
              onChange={this.handleTabClick}
              indicatorColor="primary"
              textColor="primary"
              scrollable
              scrollButtons="auto"
              centered
            >
              <Tab icon={<AllReportsIcon />} label="All Reports" key="All Reports" name="All Reports" />
              <Tab icon={<AllReportsIcon />} label="Searched Reports" key = "Searched Reports" name="Searched Reports" />
              <Tab icon={<ReadCaseIcon />} label="Read" key="Read" name="Read" />
              <Tab icon={<TrashIcon />} label="Trash" key="Trash" name="Trash" />
              <Tab icon={<NewCaseIcon />} label="New Case" name="New Case" />
              
              {this.state.userBins.map((bin) => {
                switch (bin.name) {
                  case 'Trash':
                  case 'All Reports':
                  case 'Read':
                  case 'Searched Reports':
                  return null;
                  default:
                    return (
                      <Tab icon={<CaseIcon />} label={bin.name} key={bin.case_id} name={bin.name} />
                    );
                }
              })}
            </Tabs>
          </AppBar>
          
          {/* ====== SideBar for Viewing the Case Summary ====== */}
          <div id="summary-sidebar" className={this.calculateSummarySize()}>
            <CaseSummaryListing
              updateTab={this.updateTab}
              bins={this.state.userBins}
              userID={this.props.userID}
              summaryOpen={this.state.summaryOpen}
              summaryCounter={this.state.summaryCounter}
              handleClickPieChart={this.handleCaseChangePrimary}
              changeTab = {this.changeTab}
              printSearchResults = {this.printSearchResults}
              returnedResults = {this.state.returnedResults}
              returnedIds = {this.state.returnedIds}
              setSearchLoading = {this.setSearchLoading}
            />
          </div>
          <div key='summaryCollapse' className={this.props.classes.collapseDivider} style={{float: 'left'}} onClick={this.handleViewCaseSummary}>
            <div className={(this.state.summaryOpen) ? this.props.classes.inverseTri : this.props.classes.collapseTri}/>
          </div>
          {/* ====== Table for Viewing the table of reports ====== */}
          <div key='reporttable' className={this.props.classes.tableContainer} >
            <ReportTable
              reportPanel = {this.state.reportOpen}
              bin={this.state.bin}
              padding = '0px'
              bins={this.state.userBins}
              summaryOpen={this.state.summaryOpen}
              toTitleCase={this.toTitleCase}
              tableClass={this.state.summaryOpen}
              incrementSummary={this.updateSummary}
              primaryChosen = {this.state.primaryChosen}
              supportiveChosen = {this.state.supportiveChosen}
              handleViewReport = {this.handleViewReportPanel}
              changeTab = {this.changeTab}
              printSearchResults = {this.printSearchResults}
              currentTab={this.state.currentTab}
              returnedResults = {this.state.returnedResults}
              returnedIds = {this.state.returnedIds}
              searchLoading = {this.state.searchLoading}
              setSearchLoading = {this.setSearchLoading}
            />
          </div>
          <div key='reportCollapse' className={this.props.classes.collapseDivider}  onClick={this.handleHideReport}>
            <div className={(this.state.textOpen) ? this.props.classes.collapseTri : this.props.classes.inverseTri}/>
          </div>
            {/* ====== SideBar for reading a report ======*/}
            <div id="report-sidebar" className={this.calculateReportSize()}  >
                <ReportPanel
                    updateTab={this.updateTab}
                    bins={this.state.userBins}
                    primaryid={this.state.primaryIDReport}
                    userID={this.props.userID}
                    userEmail={this.props.userEmail}
                    reportOpen={this.state.reportOpen}
                />
            </div>
          {/* ====== Modal for Creating a New Case ====== */}
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.newCaseModalOpen}
            onClose={this.handleNewCaseClose}
          >
            <Paper elevation={8} className={this.props.classes.newCaseModal}>
              <Typography type="title" id="modal-title">
                Create a Case
              </Typography>
              <hr />
              <TextField
                label="Case Name"
                placeholder="Advil"
                id="newCaseName"
                style={{ margin: 12, width: '100%' }}
              />
              <TextField
                multiline
                rowsMax="4"
                label="Case Description"
                placeholder="This case contains reports about Advil"
                id="newCaseDesc"
                style={{ margin: 12, width: '100%' }}
              />
              <hr />
              <Button raised onClick={this.handleNewCaseClick} style={{ margin: 12 }} color="primary">Create Case</Button>
            </Paper>
          </Modal>
          {/* ====== Snackbar for Notificaitons to the User ====== */}
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.snackbarOpen}
            onClose={this.handleCloseSnackbar}
            transitionDuration={1000}
            SnackbarContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.snackbarMessage}</span>}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  userID: state.user.userID,
    userEmail: state.user.userEmail,
  isLoggedIn: state.user.isLoggedIn,
    /**********  Searched reports */
});

/**
 * Conect this component to the Redux global State.
 * Maps Redux state to this comonent's props.
 * Gets Redux actions to be called in this component.
 * Exports this component with the proper JSS styles.
 */
export default connect(
  mapStateToProps,
  { getUserCases, createUserBin, getCountData },
)(withStyles(styles)(ReportList));
