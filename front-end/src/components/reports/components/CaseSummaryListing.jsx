import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';
import CaseSummary from '../../cases/CaseSummary';
import { moveReport, getCaseReports, getInstances, getReportsInCases } from '../../../actions/reportActions';
import CaseIcon from '../../../resources/CaseIcon';
import styles from './CaseSummaryListingStyles';
import {Collapse} from 'react-collapse';

/**
 * This is the component for the Case Summary Listing Planel
 */
class CaseSummaryListing extends React.PureComponent {
  static propTypes = {
    bins: PropTypes.arrayOf(PropTypes.object).isRequired,
    summaryCounter: PropTypes.number.isRequired,
    userID: PropTypes.number.isRequired,
    getReportsInCases: PropTypes.func,
    classes: PropTypes.shape({
      summaryContainer: PropTypes.string,
      expansionPanelSummary: PropTypes.string,
      styledEPSummary: PropTypes.string,
    }).isRequired,
  }

  constructor(props){
    super(props);
    this.state = {
        expandedPanelName: 'none',
    }
  };

  handleCaseExpand = (event) => {
    if(this.state.expandedPanelName === event.target.id){
      return this.setState({expandedPanelName: 'none'})
    } else {
      this.setState({expandedPanelName: event.target.id})
    }
  };

  renderListItem = (bin) => {
    switch (bin.name) {
      case 'Trash':
      case 'Read':
      case 'All Reports':
        return null;
      default:
        return (
          <div key={bin.case_id} >
            <div id='yes' className={this.props.classes.expansionTitle} onClick={(e) => this.handleCaseExpand(e)}><Typography id={bin.name} type='button'>{bin.name}</Typography></div>
            <Collapse isOpened={(this.state.expandedPanelName === bin.name) ? true : false}>
              <CaseSummary
                caseID={bin.case_id}
                userID={this.props.userID}
                summaryCounter={this.props.summaryCounter}
                updateTab={this.props.updateTab}
                handleClick={this.props.handleClickPieChart}
              />
            </Collapse>
          </div>
        );
    }
  };


  render() {
    return (
      <Paper className={this.props.classes.summaryContainer} elevation={4}>
        <Typography type="title" style={{ padding: '10px' }}>
          Case Summaries
        </Typography>
        <Divider light />
        {this.props.bins.map(bin => (
          this.renderListItem(bin)
          ))}
      </Paper>
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
  { moveReport, getReportsInCases, getCaseReports, getInstances },
)(withStyles(styles)(CaseSummaryListing));
