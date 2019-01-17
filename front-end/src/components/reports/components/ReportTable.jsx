import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  RowDetailState, SortingState, IntegratedSorting, PagingState, IntegratedPaging,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  DragDropProvider,
  TableColumnReordering,
  TableRowDetail,
  PagingPanel,
  TableColumnResizing,
} from '@devexpress/dx-react-grid-material-ui';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Divider from 'material-ui/Divider';
import MaterialTooltip from 'material-ui/Tooltip';
import Snackbar from 'material-ui/Snackbar';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import { FormControlLabel } from 'material-ui/Form';
import _ from 'lodash';
import { moveReport, getCaseReports, getReportNarrativeFromID, getReportsInCases , setAllReports, executeSearch} from '../../../actions/reportActions';
import QuillEditor from '../../editor/components/QuillEditor';
import ReadCaseIcon from '../../../resources/ReadCaseIcon';
import ClearFilterIcon from '../../../resources/RemoveFromCaseIcon';
import CaseIcon from '../../../resources/CaseIcon';
import TrashIcon from '../../../resources/TrashIcon';
import styles from './ReportTableStyles';


/**
 * This is the component for the Report Table
 */
class ReportTable extends React.PureComponent {
  static propTypes = {
    printSearchResults: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    getCaseReports: PropTypes.func.isRequired,
    setAllReports: PropTypes.func.isRequired,
      executeSearch: PropTypes.func.isRequired,
    moveReport: PropTypes.func.isRequired,
    getReportNarrativeFromID: PropTypes.func.isRequired,
    getReportsInCases: PropTypes.func.isRequired,
    toTitleCase: PropTypes.func.isRequired,
      primaryChosen:  PropTypes.bool,
      supportiveChosen:  PropTypes.bool,
      handleViewReport: PropTypes.func,
    incrementSummary: PropTypes.func.isRequired,
    summaryOpen: PropTypes.bool.isRequired,
    bins: PropTypes.arrayOf(PropTypes.object).isRequired,
    filters: PropTypes.shape({
      init_fda_dt: PropTypes.object,
      sex: PropTypes.array,
      occr_country: PropTypes.array,
      age: PropTypes.array,
      occp_cod: PropTypes.array,
      meType: PropTypes.array,
      product: PropTypes.array,
      stage: PropTypes.array,
      cause: PropTypes.array,
    }).isRequired,
    bin: PropTypes.string.isRequired,
    userID: PropTypes.number.isRequired,
    userEmail: PropTypes.string,
    searchReports: PropTypes.array,
    classes: PropTypes.shape({
      tableWrapper: PropTypes.string,
      tableContainer: PropTypes.string,
      searchBar: PropTypes.string,
      moveToCaseDetailsContainer: PropTypes.string,
      caseGridList: PropTypes.string,
      sendToCaseContainer: PropTypes.string,
      tableDetailCell: PropTypes.string,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      firstId: 0,
      firstFound: false,
      data: [],
      allData:[],
      expandedRows: [],
      tableHeight: 0,
      stillResizingTimer: '',
      currentlyInCase: [],
      evidenceType: {},
      snackbarOpen: false,
      snackbarMessage: '',
      loadingData: true,
      keepTableWhileLoading: false,
      pageSize: 50,
      currentPage: 0,
        returnedResults: [1, 2, 3],

      /**
       * Default widths for the columns of the table
       */
      widths: {
        //init_fda_dt: 85,
        primaryid: 80,
        age_year: 30,
        sex: 30,
        drugname: 150,
        me_type: 100,
        outc_cod: 50
      },

      /**
       * Custom Sorting Functions
       */
      customSorting: [
        //{ columnName: 'init_fda_dt', compare: this.sortNumbers },
        { columnName: 'primaryid', compare: this.sortNumbers },
        { columnName: 'age_year', compare: this.sortNumbers },
        { columnName: 'sex', compare: this.sortText },
        { columnName: 'drugname', compare: this.sortText },
        { columnName: 'me_type', compare: this.sortText },
        { columnName: 'outc_cod', compare: this.sortText }
      ],
    }
      //
  }

  /**
   * Sends fetch request to retrieve list of reports to be shown in table
   */
  componentWillMount() {
    if(this.props.bin !== 'searched reports'){
      this.props.getCaseReports(this.props.bin, this.props.userID)
      .then(reports => {
        this.props.setAllReports(reports)
        this.setState({
        data: reports,
        allData: reports,
        loadingData: false,
      })
      });
    }
    this.updateHighlightedRows();
    this.updateEvidenceRows();
  }

  componentDidMount() {
    this.resizeTable();

    // Listen for window resize, but wait till they have stopped to do the size calculations.
    window.addEventListener('resize', this.resizeTimer);
  }

  componentWillReceiveProps(nextProps){
    // console.log(this.state.allData)
    if (nextProps.searchedReports.length!==0){
      console.log(nextProps);
      this.setState({ data:nextProps.searchedReports});
    }
  }

  /**
   * Checks if the selected bin in the ReportList component changes and retrieves
   * new list of reports if necessary
   */
  componentDidUpdate(prevProps) {
    if (prevProps.bin !== this.props.bin || !_.isEqual(this.props.filters, prevProps.filters)) {
      if(this.props.bin !== 'searched reports'){
          this.setState({
            loadingData: true,
          });
      
          this.props.getCaseReports(this.props.bin, this.props.userID)
            .then((reports) => {
              this.props.setAllReports(reports);
              this.updateEvidenceRows();
              this.setState({
                data: reports,
                loadingData: false,
              });
              this.changeExpandedDetails([]);
            });
      }
      // else {
      //   this.updateEvidenceRows();
      // }
    }
  }

  componentWillUnmount() {
    // Remove the event listeners when unmounting
    window.removeEventListener('resize', this.resizeTimer);
  }

  /**
   * Updates the column widths
   */
  onColumnWidthsChange = (widths) => {
    this.setState({ widths });
  };

  /**
   * Gets the report narrative for a given primaryid
   */
  getReportNarrative = (primaryid) => {
    this.props.getReportNarrativeFromID(primaryid)
      .then((rows) => {
        if (rows.length > 0) {
          return `${rows[0].report_text}`;
        }
        return 'Unable to Retrieve Narrative';
      });
  };



  /**
   * Names and values for the columns of the table
   */
  columns = [
    {
      title: 'Report ID',
      name: 'primaryid',
    },
    {
      title: 'Age',
      name: 'age_year',
    },
    {
      title: 'Sex',
      name: 'sex',
    },
    {
      title: 'Drugs',
      name: 'drugname',
    },
    {
      title: 'Medication Error',
      name: 'me_type',
    },
    {
      title: 'Outcome',
      name: 'outc_cod',
    },
  ];
  /**
   * Names and values for the columns of the table
   */
  columns2 = [
    {
      title: 'Report ID',
      name: 'primaryid',
    },

  ];

  /**
   * Sets what rows are expanded in the table
   */
  changeExpandedDetails = (expandedRows) => {
    this.setState({ expandedRows });
  };

  updateHighlightedRows = () => {
    this.props.getReportsInCases(this.props.userID)
      .then((response) => {
        this.setState({
          currentlyInCase: response.reduce((acc, row) => {
            const caseNames = (acc[row.primaryid])
              ? acc[row.primaryid].concat(row.name)
              : [row.name];
            return ({
              ...acc,
              [row.primaryid]: caseNames,
            });
          }, {}),
        });
      });
  };

  updateEvidenceRows = () => {
    if (this.props.bin !== 'searched reports') {
      this.props.getReportsInCases(this.props.userID)
        .then((response) => {
          this.setState({
            evidenceType: response.filter(row => row.name.toLowerCase() === this.props.bin.toLowerCase())
              .reduce((acc, row) => ({
                ...acc,
                [row.primaryid]: row.type,
              }), {}),
          });
        });
    } else {
      this.setState({
        evidenceType: [],
      });
    }
  }


  updateSummary = () => {
    this.props.incrementSummary();
  }

  /**
   * After 100ms of not resizing, we will then resize the graph (this improves performance)
   */
  resizeTimer = () => {
    clearTimeout(this.state.stillResizingTimer);
    this.setState({ stillResizingTimer: setTimeout(this.resizeTable, 100) });
  }

  /**
   * Compare functions for strings sorting
   */
  sortText = (a, b) => ((a < b) ? -1 : 1)

  /**
   * Compare functions for number sorting
   */
  sortNumbers = (a, b) => ((Number(a) < Number(b)) ? -1 : 1)

  /**
   * Handler to close the SnackBar
   */
  handleCloseSnackbar = () => {
    this.setState({ snackbarOpen: false });
  };

  //handleChoose

  /**
   * Sends a backend request to move a report from one bin to another
   */
  handleMoveReport = (primaryid, fromBin, toBin, type) => {
    this.props.moveReport(primaryid, fromBin, toBin, this.props.userID, type ? 'primary' : 'supportive')
      .then(() => {
        if (toBin === 'trash' || toBin === 'all reports') {
          this.setState({
            loadingData: true,
            keepTableWhileLoading: true,
          });
          this.props.getCaseReports(this.props.bin, this.props.userID)
            .then(reports => this.setState({
              data: reports,
              loadingData: false,
              keepTableWhileLoading: false,
            }));
        } else {
          this.updateHighlightedRows();
          this.updateEvidenceRows();
        }
        this.updateSummary();
        this.setState({
          snackbarOpen: true,
          snackbarMessage: `Report ${primaryid} Moved to ${this.props.toTitleCase(toBin)}`,
        });
      });
    if (toBin === 'trash' || toBin === 'all reports') {
      const newExpandedRows = this.state.expandedRows;
      newExpandedRows.splice(this.state.expandedRows.indexOf(primaryid.toString()), 1);
      this.changeExpandedDetails(newExpandedRows);
    }
  };

  changeCurrentPage = currentPage => this.setState({ currentPage });
  changePageSize = pageSize => this.setState({ pageSize });

  /**
   * Calculate the size of the table
   */
  resizeTable = () => {
    const container = document.getElementById('table-container');
    const containerHeight = window.getComputedStyle(container, null).getPropertyValue('height');
    this.setState({
      tableHeight: parseInt(containerHeight || 800, 10),
      stillResizingTimer: '',
    });
  };

  COLORS = {
    supportive: 'rgba(12, 200, 232, 0.25)',
    primary: 'rgba(12, 232, 142, 0.25)',
  };

  /**
   * This returns the table Row component with the added background color
   * if the report is in any case for the current user
   */
  TableRow = ({ row, ...props }) => {

    if (!this.state.firstFound) {

      this.setState({firstFound : true}, function () {
        console.log("Table Row " + props.tableRow.rowId);
        this.props.handleViewReport(props.tableRow.rowId);

      });
    }

    let incase;
    //NEED TO PUT IT IN HERE
      let evidenceType;
    let backgroundColor;
    switch (this.props.bin) {
      case 'all reports':
        incase = this.state.currentlyInCase[props.tableRow.rowId];
        console.log("incase " + incase);
        if (!incase) {
          backgroundColor = '';
        } else {
          backgroundColor = (incase.includes('read') && incase.length === 1) ? 'RGBA(255,0,255, 0.2)' : 'RGBA(131, 255, 168, 0.2)';

        }
        break;
      case 'trash':
      case 'read':
        backgroundColor = '';
        break;
        default:
        evidenceType = this.state.evidenceType[props.tableRow.rowId];
        backgroundColor = (evidenceType === 'primary') ? ((this.props.primaryChosen === true) ? 'rgba(255, 0, 255, 0.25)' : this.COLORS.primary)
            : ((this.props.supportiveChosen === true) ? 'rgba(255, 0, 255, 0.25)' : this.COLORS.supportive );

    }
    return (
      <Table.Row
        {...props}
        style={{
          backgroundColor,

        }}
      />
    );
  };

  //EXECUTE SEARCH
  search = () => {

    var contents = document.getElementById('search').value;

    console.log('Search');



    var results;
    var resultsArr = [];

    this.props.executeSearch(contents)
      .then((data)=> {
        console.log("data " + data);
        results = JSON.parse(data);
        console.log(results);
        console.log(results.results[0].id);


        //console.log("this.state.returnedResults " +  this.state.returnedResults);

        var printOut = '';

        console.log("length " + results.results.length);

        var j = 0;

        var allGood = true;

          while (results.results[j] && allGood) {
          if (Number.isInteger(Number(j))) {

            console.log(results.results[j].id);

            printOut = printOut.concat(results.results[j].id + '\n' + results.results[j].body_highlights[0] + '\n');

              console.log("resultsArr j " + j );

              resultsArr[j] = results.results[j].id;

              console.log( "resultsArr at j" + resultsArr[j]);

              j++;


          }
          else {
              allGood = false;
              console.log("NaN")
          }
        }

        console.log("Outside While");
          console.log("resultsArr " +  resultsArr);

          //console.log("returnedResults" + this.state.returnedResults);
          document.getElementById("searchResults").value = printOut;
          this.handleSearchResults(resultsArr);




      });


  };

  handleSearchResults = (array) => {

    this.props.changeTab(1);

    this.props.printSearchResults(array);

    this.setState({data : array});
  };

  handleToggleChange = primaryid => (event, checked) => {
      console.log("handleToggleChange");
    if (!(this.props.bin === 'all reports' || this.props.bin === 'read' || this.props.bin === 'trash')) {
      this.handleMoveReport(
        primaryid,
        '',
        this.props.bin,
        checked,
      );
    } else {
      this.setState({ [primaryid]: checked });
    }
  };

  renderMoveToIcon = (binName, greyOutCaseIcon) => {
    switch (binName) {
      case 'Trash':
        return (
          <div>
            <TrashIcon />
            <Typography style={{ display: 'block' }} type="subheading">
              {binName}
            </Typography>
          </div>
        );
      case 'Read':
        return (
          <div>
            {(greyOutCaseIcon)
              ? <ReadCaseIcon width={45} height={45} style={{ filter: 'hue-rotate(270deg)' }} />
              : <ReadCaseIcon width={45} height={45} />}
            <Typography style={{ display: 'block' }} type="subheading">
              {binName}
            </Typography>
          </div>
        );
      case 'All Reports':
        return (
          <div>
            <ClearFilterIcon />
            <Typography style={{ display: 'block' }} type="subheading">
              Remove From Case
            </Typography>
          </div>
        );
      default:
        return (
          <div>
            {(greyOutCaseIcon)
              ? <CaseIcon width={45} height={45} style={{ filter: 'hue-rotate(270deg)' }} />
              : <CaseIcon width={45} height={45} />}
            <Typography style={{ display: 'block' }} type="subheading">
              {binName}
            </Typography>
          </div>
        );
    }
  };

  renderTypeToggle = (row) => {

    return (this.props.bin === 'all reports' || this.props.bin === 'read' || this.props.bin === 'trash')
      ? (
        <MaterialTooltip
          title="This toggle does not update this report inside you're cases. You must re-add this report to a case for your change to appear"
          placement="top"
          enterDelay={50}
          classes={{
            tooltip: this.props.classes.tooltipStyle,
            popper: this.props.classes.tooltipStyle,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={this.state[row.row.primaryid]}
                onChange={this.handleToggleChange(row.row.primaryid)}
                color = "primary"
              />
            }
            label={this.state[row.row.primaryid] ? 'Primary Evidence' : 'Supportive Evidence'}
          />
        </MaterialTooltip>
      )
      : (
        <MaterialTooltip
          title="This updates the evidence type for this report in only this case"
          placement="top"
          enterDelay={50}
          classes={{
            tooltip: this.props.classes.tooltipStyle,
            popper: this.props.classes.tooltipStyle,
          }}
        >

          <FormControlLabel
            control={
              <Switch
                checked={this.state.evidenceType[row.row.primaryid] === 'primary'}
                onChange={this.handleToggleChange(row.row.primaryid)}
                color="primary"
              />
            }
            label={(this.state.evidenceType[row.row.primaryid] === 'primary') ? 'Primary Evidence' : 'Supportive Evidence'}
          />
        </MaterialTooltip>
      );
  };


  /**
   * Defines the html content inside each expandable dropdown area for each row
   * of the table
   */
  renderDetailRowContent = row => (
    <div onClick={this.props.handleViewReport(row.row.primaryid)}>
      <div className="col-sm-3" style={{ marginBottom: '15px' }}>
        <Paper elevation={6} style={{ padding: '5px' }} >
          <div className="col-sm-12">
            {this.renderTypeToggle(row)}
          </div>
          <div className="col-sm-12">
            <Link href="/" to={`/pdf/${row.row.primaryid}`} target="_blank">
              <Button raised className="cal-button" color="primary">Go to report text</Button>
            </Link>
          </div>
          <div style={{ clear: 'both', float: 'none' }}>&nbsp;</div>
        </Paper>
      </div>
      <div className={`${this.props.classes.sendToCaseContainer} col-sm-9`}>
        <Paper elevation={6}>
          <div className="col-sm-12" style={{ padding: '5px 10px' }}>
            <Typography style={{ fontSize: '14px' }} type="button">
              Add Report to Case:
            </Typography>
          </div>
          <div className={this.props.classes.moveToCaseDetailsContainer}>
            {this.props.bins.map((bin, index) => (
              (this.props.bin.toLowerCase() !== bin.name.toLowerCase())
                ? (
                  <MaterialTooltip
                    title={(bin.name.toLowerCase() === 'trash') ? 'HERE IT IS Warning: Adding this report to the Trash also removes the report from any other cases it is in' : 'Adds this report to this case'}
                    placement="top"
                    enterDelay={50}
                    classes={{
                      tooltip: this.props.classes.tooltipStyle,
                      popper: this.props.classes.tooltipStyle,
                    }}
                  >
                    <Button
                      flat="true"
                      key={bin.case_id}
                      className={this.props.classes.caseGridList}
                      onClick={() => {
                        this.handleMoveReport(
                          row.row.primaryid,
                          this.props.bin,
                          this.props.bins[index].name.toLowerCase(),
                          this.state[row.row.primaryid],
                        );
                      }}
                    >
                      {(this.state.currentlyInCase[row.row.primaryid]
                        && this.state.currentlyInCase[row.row.primaryid].includes(bin.name.toLowerCase()))
                        ? this.renderMoveToIcon(bin.name, true)
                        : this.renderMoveToIcon(bin.name)}
                    </Button>
                  </MaterialTooltip>
                )
                : null
            ))}
          </div>
        </Paper>
      </div>
      {/*
      <div style={{ marginTop: '10px' }} className="col-sm-12">

        <ExpansionPanel elevation={6}>
          <ExpansionPanelSummary   expandIcon={<ExpandMoreIcon />}>
            <Typography type="subheading" >Annotate Narrative</Typography>
          </ExpansionPanelSummary>
          <Divider light />
          <ExpansionPanelDetails>
            <QuillEditor
              primaryid={Number(row.row.primaryid, 10)}
              incrementSummary={this.props.incrementSummary}

            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
      */}
    </div>
  );


  render() {

    //console.log("Hello World " + this.state.data[0].primaryId);

    return (
      <div id='table-wrapper' className={this.props.classes.tableWrapper}>
      <input id='search' type='text' className={this.props.classes.searchBar} placeholder="Search through reports..." onKeyDown={(e) => {if(e.key === 'Enter'){this.search()}}} />
      <div style={{padding: '4px'}}>
        {(this.props.currentTab.toString() == 1) ?
        <textarea id = "searchResults" style={{ display: 'block'}} cols = "80" rows = "5" >  </textarea> :
            <textarea id = "searchResults" style={{ display: 'none'}} cols = "80" rows = "5" >  </textarea>}
      </div>
      <Paper id="table-container" className={this.props.classes.tableContainer} elevation={4}>
        {(this.state.loadingData)
          ? <div
              style={{ position: 'absolute', top: '50px', left: '0px', width: '100%', height: 'calc(100% - 50px)', backgroundColor: 'rgba(25, 25, 25, 0.5)', zIndex: '10000', overflow: 'scroll' }}
            >
              <div style={{ width: 'fit-content', position: 'absolute', top: '50%', left: '50%', transform: 'translateY(-50%) translateX(-50%)' }}> 
                <CircularProgress size={300} />
              </div>
            </div>
          : null}
        {console.log("data In ReportTable")}
          {(this.state.tableHeight !== 0 && this.state.stillResizingTimer === '' && (!this.state.loadingData || this.state.keepTableWhileLoading))
            ? (

              <Grid
                rows={this.state.data}
                columns={(this.props.currentTab.toString() == 1) ? this.columns2 : this.columns}
                getRowId={row => row.primaryid}

              >
                <RowDetailState
                  expandedRows={this.state.expandedRows}
                  onExpandedRowsChange={this.changeExpandedDetails}
                />
                <DragDropProvider />
                <SortingState
                  defaultSorting={[
                    { columnName: 'Event Date', direction: 'asc' },
                  ]}
                />
                <PagingState
                  currentPage={this.state.currentPage}
                  onCurrentPageChange={this.changeCurrentPage}
                  pageSize={this.state.pageSize}
                  onPageSizeChange={this.changePageSize}
                />
                <IntegratedSorting
                  columnExtensions={this.state.customSorting}
                />
                <IntegratedPaging />
                <Table rowComponent={this.TableRow} height={this.state.tableHeight} />
                <PagingPanel/>
                <TableColumnResizing
                  columnWidths={this.state.widths}
                  onColumnWidthsChange={this.onColumnWidthsChange}
                />
                <TableHeaderRow showSortingControls />
                <TableColumnReordering defaultOrder={this.columns.map(column => column.name)} />
                <TableRowDetail
                  cellComponent={(props) => <TableRowDetail.Cell className={this.props.classes.tableDetailCell} {...props} /> }
                  contentComponent={this.renderDetailRowContent}
                />
              </Grid>
            )
            : null
        }

        {/* ====== Snackbar for Notificaitons to the User ====== */}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={this.state.snackbarOpen}
          onClose={this.handleCloseSnackbar}
          transitionDuration={300}
          autoHideDuration={3000}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={
            <span id="message-id" style={{ color: 'LightGreen' }} >{this.state.snackbarMessage}</span>
          }
        />
      </Paper>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  filters: state.filters,
  userID: state.user.userID,
});

/**
 * Conect this component to the Redux global State.
 * Maps Redux state to this comonent's props.
 * Gets Redux actions to be called in this component.
 * Exports this component with the proper JSS styles.
 */
export default connect(
  mapStateToProps,
  {
    moveReport,
    getCaseReports,
      executeSearch,
    setAllReports,
    getReportNarrativeFromID,
    getReportsInCases,
  },
)(withStyles(styles)(ReportTable));
