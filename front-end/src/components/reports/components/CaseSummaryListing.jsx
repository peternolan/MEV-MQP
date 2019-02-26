import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
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
    setSearchLoading: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    printSearchResults: PropTypes.func.isRequired,
    bins: PropTypes.arrayOf(PropTypes.object).isRequired,
    summaryCounter: PropTypes.number.isRequired,
    userID: PropTypes.number.isRequired,
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
          <div key={bin.case_id} className={this.props.classes.borderBottom}>
            <div id={bin.name} className={this.props.classes.expansionTitle} onClick={(e) => this.handleCaseExpand(e)}
              style={{backgroundColor:(this.state.expandedPanelName === bin.name) ? '#dbf0ff' : '#ffffff'}}>
              <CaseIcon
                  width={30}
                  height={30}
                  style={{marginRight:10}}
              />
              <Typography id={bin.name} variant='button' className={this.props.classes.titleText}>{bin.name}</Typography>
            </div>
            <Collapse isOpened={(this.state.expandedPanelName === bin.name) ? true : false}>
              <CaseSummary
                setSearchLoading = {this.props.setSearchLoading}
                changeTab = {this.props.changeTab}
                printSearchResults = {this.props.printSearchResults}
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
export default withStyles(styles)(connect(
  mapStateToProps,
  { moveReport, getReportsInCases, getCaseReports, getInstances },
)(CaseSummaryListing));
