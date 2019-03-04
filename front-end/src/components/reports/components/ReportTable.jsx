import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import MaterialTooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import CheckBox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import FormControlLabel  from '@material-ui/core/FormControlLabel';
import _ from 'lodash';
import { moveReport, getCaseReports, getReportNarrativeFromID, getReportsInCases, getReportsFromCase , setAllReports, executeSearch, getInstances, getAgeAndCode} from '../../../actions/reportActions';
import ReadCaseIcon from '../../../resources/ReadCaseIcon';
import ClearFilterIcon from '../../../resources/RemoveFromCaseIcon';
import CaseIcon from '../../../resources/CaseIcon';
import TrashIcon from '../../../resources/TrashIcon';
import styles from './ReportTableStyles';
import EllipsisIcon from '../../../resources/ellipsis.svg';
import { Menu, Item, Submenu, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';

/**
 * This is the component for the Report Table
 */
class ReportTable extends React.PureComponent {
  static propTypes = {
    previousSearchString: PropTypes.string.isRequired,
    setSearchLoading: PropTypes.func.isRequired,
    searchLoading: PropTypes.bool.isRequired,
    returnedIds: PropTypes.array,
    returnedResults: PropTypes.array,
    printSearchResults: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    setAllReports: PropTypes.func.isRequired,
    executeSearch: PropTypes.func.isRequired,
    toTitleCase: PropTypes.func.isRequired,
    primaryChosen:  PropTypes.bool,
    supportiveChosen:  PropTypes.bool,
    handleViewReport: PropTypes.func,
    incrementSummary: PropTypes.func.isRequired,
    reportOpen: PropTypes.bool,
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
      tableHeader: PropTypes.string,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      firstId: 0,
      age: 0,
      outCode: '',
      ready: false,
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
      searchTarget: 'All Reports',
      currentPage: 0,
      summaryToggleText: 'Hide',
      selected: -1,
      item: null,

      /**
       * Default widths for the columns of the table
       */
      widths: [
        { columnName: 'primaryid', width: 75 },
        { columnName: 'age_year', width: 35 },
        { columnName: 'sex', width: 35 },
        { columnName: 'drugname', width: 100 },
        { columnName: 'me_type', width: 100 },
        { columnName: 'outc_cod', width: 60 }

      ],


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
      console.log('Component Will Mount');
      //if (this.props.filters.sex.length > 0 || this.props.filters.age.length > 0  || this.props.filters.cause.length > 0
       //   || this.props.filters.meType.length > 0  || this.props.filters.occp_cod.length > 0  ||
       // this.props.filters.occr_country.length > 0  || this.props.filters.product.length > 0  || this.props.filters.stage.length > 0 ) {
       // console.log('FILTERS PRESENT');
        this.props.getCaseReports(this.props.bin, this.props.userID)
            .then(reports => {

              this.props.setAllReports(reports);

              this.setState({
                data: reports,
                allData: reports,
                loadingData: false,
              });
            });
      //}

     }


    this.updateHighlightedRows();
    this.updateEvidenceRows();
  }

  componentDidMount() {



    this.resizeTable();
    // Listen for window resize, but wait till they have stopped to do the size calculations.
    window.addEventListener('resize', this.resizeTimer);
  }

  /**
   * Checks if the selected bin in the ReportList component changes and retrieves
   * new list of reports if necessary
   */
  componentDidUpdate(prevProps) {

      if (prevProps.bin !== this.props.bin || !_.isEqual(this.props.filters, prevProps.filters)) {
      if(this.props.bin !== 'searched reports') {

        this.setState({
          loadingData: true,
        });
      }

          if (this.props.bin !== 'all reports') {
            if (this.props.filters.sex.length > 0 || this.props.filters.age.length > 0  || this.props.filters.cause.length > 0
                || this.props.filters.meType.length > 0  || this.props.filters.occp_cod.length > 0  ||
                this.props.filters.occr_country.length > 0  || this.props.filters.product.length > 0  || this.props.filters.stage.length > 0 ) {

              this.props.getCaseReports(this.props.bin, this.props.userID)
                  .then((reports) => {
                    this.props.setAllReports(reports);
                    this.updateEvidenceRows();
                    this.setState({
                      data: reports,
                      loadingData: false,
                    });
                    this.changeExpandedDetails([]);
                    //(this.state.currentTab != 0 || this.state.currentTab != 1)
                  });

            }
            else {
              console.log('SECOND ELSE')

              this.props.getCaseReports(this.props.bin, this.props.userID, {})
                  .then((reports) => {
                    this.props.setAllReports(reports);
                    this.updateEvidenceRows();
                    this.setState({
                      data: reports,
                      loadingData: false,
                    });
                    this.changeExpandedDetails([]);
                    //(this.state.currentTab != 0 || this.state.currentTab != 1)
                  });

            }

        }
        else {
          console.log('FIRST ELSE')
          this.props.getCaseReports(this.props.bin, this.props.userID)
              .then((reports) => {
                this.props.setAllReports(reports);
                this.updateEvidenceRows();
                this.setState({
                  data: reports,
                  loadingData: false,
                });
                this.changeExpandedDetails([]);
                //(this.state.currentTab != 0 || this.state.currentTab != 1)
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

  handleTargetChange = (event) => {
    this.setState({searchTarget: event.target.value});
  }

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
          if (toBin === 'trash' || toBin ==='all reports') {
            this.setState({
              loadingData: true,
              keepTableWhileLoading: true,
            });

            if (this.props.bin !== 'all reports') {
              if (this.props.filters.sex.length > 0 || this.props.filters.age.length > 0  || this.props.filters.cause.length > 0
                  || this.props.filters.meType.length > 0  || this.props.filters.occp_cod.length > 0  ||
                  this.props.filters.occr_country.length > 0  || this.props.filters.product.length > 0  || this.props.filters.stage.length > 0 ) {

                console.log("FILTERS")
                this.props.getCaseReports(this.props.bin, this.props.userID)
                    .then(reports => this.setState({
                      data: reports,
                      loadingData: false,
                      keepTableWhileLoading: false,
                    }));
              }
              else {

                console.log("NO FILTERS")
                this.props.getCaseReports(this.props.bin, this.props.userID, {})
                    .then(reports => this.setState({
                      data: reports,
                      loadingData: false,
                      keepTableWhileLoading: false,
                    }));

              }
            }
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
    if (toBin === 'trash' || toBin ==='all reports') {
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


  reportToPanel = ( id ) => {
    this.setState({selected: id,}, function() {
      this.props.handleViewReport(id);
    });
  }



  /**
   * This returns the table Row component with the added background color
   * if the report is in any case for the current user
   */
  TableRow = ({ row, ...props }) => {


    if (!this.state.firstFound) {

      this.setState({firstFound : true}, function () {

        this.props.handleViewReport(props.tableRow.rowId);

      });
    }

    let incase;
    //NEED TO PUT IT IN HERE
    let evidenceType;
    let backgroundColor;

    switch (this.props.bin) {
      case 'searched reports':
      case 'all reports':
        incase = this.state.currentlyInCase[props.tableRow.rowId];

        if (!incase) {
          backgroundColor = '';
        } else {
          backgroundColor = (incase.includes('read') && incase.length === 1) ? '#b2abd2' : 'RGBA(131, 255, 168, 0.2)';

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
              backgroundColor: (props.tableRow.rowId === this.state.selected) ? '#dbf0ff' : backgroundColor,
              height:45,
              cursor:'pointer'
            }}
            onClick = {() => this.reportToPanel(props.tableRow.rowId)}
        />
    );
  };


  //setData =

  //EXECUTE SEARCH
  search = () => {
    var contents = document.getElementById('search').value;

    var results;

    var resultsArr = [];
    var resultIds  = [];

    var arr = [];
    this.props.setSearchLoading(true);
    this.props.executeSearch(contents)
        .then((data) => {
          results = JSON.parse(data);

          var j = 0;

          var allGood = true;

          while (results.results[j] && allGood) {
            if (Number.isInteger(Number(j))) {
              arr.push(results.results[j]);
            } else {
              allGood = false;
            }
            j++;
          }
          j = 0;
          while (arr[j]) {

            var item = arr;
            var i = 0;
            this.props.getAgeAndCode(arr[j].id).then((rows) => {

              if (rows.length > 0) {
                var age = rows[0].age_year;
                var code = rows[0].outc_cod[0];
                if (!age) {
                  age = "--";
                }
                if (!code) {
                  code = "--";
                }

                resultsArr.push({
                  primaryid: item[i].id,
                  drugname: item[i].drugname,
                  sex: item[i].sex,
                  me_type: item[i].error,
                  excerpt: item[i].report_text_highlights,
                  age_year: age,
                  outc_cod: code
                });
                resultIds.push(item[i].id);

                if (resultsArr.length >= arr.length && resultIds.length >= arr.length) {
                  this.handleSearchResults(resultsArr, resultIds, contents);
                }
              }

              i++;
            });

            j++;

          }
        });

  };

  handleSearchResults = (array1, array2, string) => {

    this.props.printSearchResults(array1,array2,string);
    this.props.changeTab('searched reports');
  };

  handleToggleChange = primaryid => (event, checked) => {
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
    var sideL = 30;
    switch (binName) {
      case 'Trash':
        return (
            <div className={this.props.classes.moveToPair}>
              <TrashIcon  width={sideL} height={sideL}/>
              <Typography variant="subheading" style={{ marginLeft: 15 }}>
                {binName}
              </Typography>
            </div>
        );
      case 'Read':
        return (
            <div className={this.props.classes.moveToPair}>
              {(greyOutCaseIcon)
                  ? <ReadCaseIcon width={sideL} height={sideL} style={{ filter: 'hue-rotate(270deg)' }} />
                  : <ReadCaseIcon width={sideL} height={sideL} />}
              <Typography variant="subheading" style={{ marginLeft: 15 }}>
                {binName}
              </Typography>
            </div>
        );
      case 'All Reports':
        return (
            <div className={this.props.classes.moveToPair}>
              <ClearFilterIcon width={sideL} height={sideL} />
              <Typography style={{ marginLeft: 15 }} variant="subheading">
                Remove From Case
              </Typography>
            </div>
        );
      default:
        return (
            <div className={this.props.classes.moveToPair}>
              {(greyOutCaseIcon)
                  ? <CaseIcon width={sideL} height={sideL} style={{ filter: 'hue-rotate(270deg)' }} />
                  : <CaseIcon width={sideL} height={sideL} />}
              <Typography variant = "subheading" style={{ marginLeft: 15 }}>
                {binName}
              </Typography>
            </div>
        );
    }
  };

  renderTypeToggle = (row) => {
    return (
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
              style={{height:35}}
              control={
                <CheckBox
                    style={{height:35}}
                    checked={this.state.evidenceType[row.row.primaryid] === 'primary'}
                    onChange={this.handleToggleChange(row.row.primaryid)}
                    color="primary"
                />
              }
              label='Primary Evidence'
          />
        </MaterialTooltip>
    );
  }
  /* Prevents a parent event from being inherited by the child */
  blockParent = e => {
    e.stopPropagation();
  }


  /**
   * Defines the html content inside each expandable dropdown area for each row
   * of the table
   */
  renderDetailRowContent = row => {
    var final;
    var dummyNode = document.createElement('div');

    if(this.props.currentTab === 1){
      final = (row.row.excerpt) ? row.row.excerpt[0] + row.row.excerpt[1] : '<div>--</div>';
    } 

    dummyNode.innerHTML = final;


    return (
    (this.props.currentTab === 1) ?
        <Paper elevation={6} style={{padding: '5px'}}>
          {dummyNode.innerText}
        </Paper>
        :
        null
    )


  }



  /* Our more options menu */
  toggleCell = row => {

    return (
        <td onClick={this.blockParent} className={this.props.classes.ellipsisFrame}>

          <MenuProvider id={row.row.primaryid} event='onClick'>
            <img src={EllipsisIcon} alt='More Options'/>
          </MenuProvider>
          <Menu id={row.row.primaryid}>
            {(this.props.bin === 'all reports' || this.props.bin === 'read' || this.props.bin === 'trash')
                ? null : <Item>{this.renderTypeToggle(row)}</Item>}
            {/* Non-Case Move Tos */}
            {this.props.bins.map((bin, index) => (
                /* We only want cases */
                (this.props.bin.toLowerCase() !== bin.name.toLowerCase() && (bin.name.toLowerCase() === 'read' || bin.name.toLowerCase() === 'trash' || bin.name.toLowerCase() === 'all reports'))
                    ? ( /* New item container for the move prompts*/
                        <Item
                            key={bin.case_id + ' ' + bin.name}
                            onClick={() => {
                              this.handleMoveReport(
                                  row.row.primaryid,
                                  this.props.bin,
                                  this.props.bins[index].name.toLowerCase(),
                                  this.state[row.row.primaryid],
                              );
                            }}
                        >
                          {
                            /* Fill with move to icons */
                            (this.state.currentlyInCase[row.row.primaryid]
                                && this.state.currentlyInCase[row.row.primaryid].includes(bin.name.toLowerCase()))
                                ? this.renderMoveToIcon(bin.name, true)
                                : this.renderMoveToIcon(bin.name)}
                        </Item>
                    )
                    : null
            ))}
            {/* Generate submenu */}
            <Submenu label='Add to case:'>
              {this.props.bins.map((bin, index) => (
                  /* We only want cases */
                  (this.props.bin.toLowerCase() !== bin.name.toLowerCase() && bin.name.toLowerCase() !== 'read' && bin.name.toLowerCase() !== 'trash' && bin.name.toLowerCase() !== 'all reports')
                      ? ( /* New item container for the move prompts*/
                          <Item
                              key={bin.case_id + ' ' + bin.name}
                              onClick={() => {
                                this.handleMoveReport(
                                    row.row.primaryid,
                                    this.props.bin,
                                    this.props.bins[index].name.toLowerCase(),
                                    this.state[row.row.primaryid],
                                );
                              }}
                          >
                            { /* Fill with move to icons */
                              (this.state.currentlyInCase[row.row.primaryid]
                                  && this.state.currentlyInCase[row.row.primaryid].includes(bin.name.toLowerCase()))
                                  ? this.renderMoveToIcon(bin.name, true)
                                  : this.renderMoveToIcon(bin.name)}
                          </Item>
                      )
                      : null
              ))}
            </Submenu>
          </Menu>
        </td>
    );
  }
  render() {

    return (
        <div id='table-wrapper' className={this.props.classes.tableWrapper}>
          <input id='search' defaultValue={this.props.previousSearchString} type='text' className={this.props.classes.searchBar} placeholder="Search through reports..." onKeyDown={(e) => {if(e.key === 'Enter'){this.search()}}} />
          <select value={this.state.searchTarget} onChange={this.handleTargetChange} className={this.props.classes.searchDD}>
            {this.props.bins.map((bin) => {
              switch(bin.name){
                case 'Trash':
                case 'Read':
                  return null;
                default:
                  return(
                      <option value={bin.name} key={bin.name}>{bin.name}</option>
                  );
              }
            })};
          </select>
          <Paper id="table-container" className={this.props.classes.tableContainer} elevation={4}>

            {(this.state.loadingData || this.props.searchLoading)
                ? <div
                    style={{ position: 'absolute', top: '50px', left: '0px', width: '100%', height: 'calc(100% - 50px)', backgroundColor: 'rgba(25, 25, 25, 0.5)', zIndex: '10000', overflow: 'scroll' }}
                >
                  <div style={{ width: 'fit-content', position: 'absolute', top: '50%', left: '50%', transform: 'translateY(-50%) translateX(-50%)' }}>
                    <CircularProgress size={300} />
                  </div>
                </div>
                : null}
            {(this.state.tableHeight !== 0 && this.state.stillResizingTimer === '' && (!this.state.loadingData || this.state.keepTableWhileLoading))
                ? (

                    <Grid
                        rows={(this.props.currentTab === 1) ? this.props.returnedResults : this.state.data}
                        columns={this.columns}
                        getRowId={(this.props.currentTab === 1) ? row => row.primaryid: row => row.primaryid }
                    >
                      <RowDetailState
                          expandedRowIds={(this.props.currentTab === 1) ? this.props.returnedIds : this.state.expandedRows}
                          onExpandedRowIdsChange={this.changeExpandedDetails}
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
                      <TableHeaderRow/>
                      <TableColumnReordering defaultOrder={this.columns.map(column => column.name)} />

                      <TableRowDetail
                          toggleCellComponent = {this.toggleCell}
                          contentComponent = {this.renderDetailRowContent}
                      />
                    </Grid>
                )
                : null
            }
            {/* ====== Snackbar for Notificaitons to the User ====== */}
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
export default withStyles(styles)(connect(mapStateToProps,{
      getReportsFromCase,
      moveReport,
      getCaseReports,
      executeSearch,
      setAllReports,
      getReportNarrativeFromID,
      getReportsInCases,
      getInstances,
      getAgeAndCode
    },
)(ReportTable));