import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
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
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core/ExpansionPanel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { moveReport, getCaseReports, getInstances } from '../../../actions/reportActions';

const styles = {};

/**
 * This is the component for the Report Table
 */
class UserReportTable extends React.PureComponent {
  static propTypes = {
    getCaseReports: PropTypes.func.isRequired,
    moveReport: PropTypes.func.isRequired,
    getInstances: PropTypes.func.isRequired,
    bins: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  }

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expandedRows: [],
      pageSize: 0,
      pageSizes: [10, 25, 50],
      currentPage: 0,
    };

    this.changeExpandedDetails = (expandedRows) => {
      this.setState({ expandedRows });
    };
  }



  /**
   * Sends fetch request to retrieve list of reports to be shown in table
   */
  componentDidMount() {

    this.props.getCaseReports(this.props.bin, this.props.userID, {})
      .then(bins => {
        console.log(bins);
        this.props.setReportCount(bins.length);
        this.setState({ data: bins });

        this.props.getInstances(bins);


      });
  }

  /**
   * Checks if the selected bin in the ReportList component changes and retrieves
   * new list of reports if necessary
   */
  componentDidUpdate(prevProps) {
    if (prevProps.bin !== this.props.bin || !_.isEqual(this.props.filters, prevProps.filters)) {
      this.props.getCaseReports(this.props.bin, this.props.userID, {})
        .then((bins) => {
          this.setState({ data: bins });
          this.props.setReportCount(bins.length);
          this.changeExpandedDetails([]);

        });
    }
  }

  /**
   * Names and values for the columns of the table
   */
  columns = [
    {
      title: 'Event Date',
      name: 'init_fda_dt',
    },
    {
      title: 'Primary ID',
      name: 'primaryid',
    },
    {
      title: 'Case ID',
      name: 'caseid',
    },
    {
      title: 'Case Version',
      name: 'caseversion',
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
      title: 'Weight',
      name: 'wt_lb',
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
   * Default widths for the columns of the table
   */
  columnWidths = {
    init_fda_dt: 85,
    primaryid: 90,
    caseid: 80,
    caseversion: 95,
    age_year: 50,
    sex: 50,
    wt_lb: 65,
    drugname: 200,
    me_type: 180,
    outc_cod: 85,
    report_text: 200,
  };

  /**
   * Sends a backend request to move a report from one bin to another
   */
  handleMoveReport = (primaryid, toBin) => {
    this.props.moveReport(primaryid, this.props.bin, toBin, this.props.userID).then(() =>
      this.props.getCaseReports(this.props.bin, this.props.userID, {})
        .then(bins => this.setState({
          data: bins,
        })));
    if (this.props.bin !== 'all reports' || toBin === 'trash') {
      const newExpandedRows = this.state.expandedRows;
      newExpandedRows.splice(this.state.expandedRows.indexOf(primaryid.toString()), 1);
      this.changeExpandedDetails(newExpandedRows);
    }
  };

  /**
   * Defines the html content inside each expandable dropdown area for each row
   * of the table
   */
  detailRowContent = row => (
    <div>
      <div className="col-sm-12" style={{ marginBottom: '15px' }}>
        <div style={{ marginTop: '10px' }}>
          <ExpansionPanel elevation={6}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography type="subheading">Preview Narrative</Typography>
            </ExpansionPanelSummary>
            <Divider light />
            <ExpansionPanelDetails style={{ display: 'block' }}>
              {/*<Link href="/" to={`/pdf/${row.row.primaryid}`} target="_blank">
                <Button raised color="primary">Go to Report Text</Button>
              </Link>*/}
              <br />
              <div style={{ marginTop: '10px', fontSize: '14px', overflowWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: row.row.report_text }} />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      </div>
    </div>
  )

  render() {
    console.log(this.state.data);
    return (
      <Grid
        id="test2"
        rows={this.state.data}
        columns={this.columns}
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
        <IntegratedSorting />
        <IntegratedPaging />
        <Table />
        <PagingPanel
          pageSizes={this.state.pageSizes}
        />
        <TableColumnResizing columnWidths={this.columnWidths} />
        <TableHeaderRow showSortingControls />
        <TableColumnReordering defaultOrder={this.columns.map(column => column.name)} />
        <TableRowDetail
          contentComponent={this.detailRowContent}
        />
      </Grid>
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
export default withStyles(styles)(connect(mapStateToProps,{moveReport, getCaseReports, getInstances})(UserReportTable));
