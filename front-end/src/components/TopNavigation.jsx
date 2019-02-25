import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import List, { ListItem, ListItemText } from '@material-ui/core/List';
import MaterialTooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import { setUserInfo } from '../actions/userActions';
import CurrentlySelectedFilters from './components/CurrentlySelectedFilters';
import wpiLogo from '../resources/wpi-logo.png';
import styles from './TopNavigationStyles';
import { toggleSexFilter, toggleAgeFilter, toggleLocationFilter, toggleOccupationFilter } from '../actions/demographicActions';
import { toggleMETypeFilter, toggleProductFilter, toggleStageFilter, toggleCauseFilter } from '../actions/visualizationActions';
import { setSelectedDate } from '../../src/actions/timelineActions';
import ClearFilterIcon from '../resources/clearFilterIcon.svg';

class TopNavigation extends Component {
  static propTypes = {
    setUserInfo: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    classes: PropTypes.shape({
      tooltipStyle: PropTypes.string,
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { open: false, left: false };
  }

  logout = (event) => {
    event.preventDefault();
    this.props.setUserInfo(false, '', -1);
    window.location = '/';
  }

  toggleDrawer = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };

  formatNumberWithCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  handleClearFilters = () => {
    this.props.toggleSexFilter('CLEAR');
    this.props.toggleAgeFilter('CLEAR');
    this.props.toggleLocationFilter('CLEAR');
    this.props.toggleOccupationFilter('CLEAR');
    this.props.toggleMETypeFilter('CLEAR');
    this.props.toggleProductFilter('CLEAR');
    this.props.toggleStageFilter('CLEAR');
    this.props.toggleCauseFilter('CLEAR');
    this.props.setSelectedDate({
      startDate: 20170324,
      endDate: 20170331,
    });
  }

  render = () =>(
    <div className={this.props.classes.topNavigationContainer}>
      <nav className={`${this.props.classes.topNavigationContainer} navbar navbar-default`}>
        <div className="container-fluid">
          <div className="pull-left">
            <div>
              <Button onClick={this.toggleDrawer('left', true)} className={this.props.classes.buttonClass}><i className="material-icons">menu</i></Button>
              <Drawer open={this.state.left} onClose={this.toggleDrawer('left', false)} classes={{ modal: this.props.classes.drawerToggleContainer }}SlideProps={{ className: this.props.classes.drawerClass }}>
                <div
                  tabIndex={0}
                  role="button"
                  onClick={this.toggleDrawer('left', false)}
                  onKeyDown={this.toggleDrawer('left', false)}
                >
                  <div className={this.props.classes.drawerHeader}>
                    <h2>Navigation Panel</h2>
                  </div>
                  <Divider style={{ backgroundColor: 'rgb(255,255,255)' }} />
                  <List>
                    <Link to="/dashboard" className={this.props.classes.listLink}>
                      <ListItem button >
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography style={{ fontSize: '16px', color: '#fff' }}>
                            Dashboard
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Link>
                    <Link to="/visualization" className={this.props.classes.listLink}>
                      <ListItem button >
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography style={{ fontSize: '16px', color: '#fff' }}>
                            Visualizations
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Link>
                    <Link to="/report" className={this.props.classes.listLink}>
                      <ListItem button >
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography style={{ fontSize: '16px', color: '#fff' }}>
                            Reports
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Link>
                    {!this.props.isLoggedIn ? (
                      <Link to="/" className={this.props.classes.listLink}>
                        <ListItem button >
                          <ListItemText
                            disableTypography
                            primary={
                              <Typography style={{ fontSize: '16px', color: '#fff' }}>
                                Login
                              </Typography>
                            }
                          />
                        </ListItem>
                      </Link>
                    ) : (
                      <Link to="/" onClick={this.logout} className={this.props.classes.listLink}>
                        <ListItem button >
                          <ListItemText
                            disableTypography
                            primary={
                              <Typography style={{ fontSize: '16px', color: '#fff' }}>
                                Logout
                              </Typography>
                            }
                          />
                        </ListItem>
                      </Link>
                    )
                    }
                  </List>
                  <Divider style={{ backgroundColor: 'rgb(255,255,255)' }} />
                </div>
                <div className={`${this.props.classes.wpiLogoContainer}`} >
                  <img src={wpiLogo} className={`${this.props.classes.wpiLogoClass} img-responsive`} alt="to help"/>
                  <Link to="/help" className={this.props.classes.listLink}>
                    <Typography style={{
 fontSize: '12px', color: '#fff', marginTop: '15px', display: 'inline-block',
}}
                    >
                      Help&nbsp;
                    </Typography>
                  </Link>
                  <Typography style={{
 fontSize: '12px', color: '#fff', marginTop: '15px', display: 'inline-block',
}}
                  >
                      |
                  </Typography>
                  <Link to="/about" className={this.props.classes.listLink}>
                    <Typography style={{
 fontSize: '12px', color: '#fff', marginTop: '15px', display: 'inline-block',
}}
                    >
                      &nbsp;About&nbsp;
                    </Typography>
                  </Link>
                  <Typography style={{
 fontSize: '12px', color: '#fff', marginTop: '15px', display: 'inline-block',
}}
                  >
                      | &copy; 2018
                  </Typography>
                </div>
              </Drawer>
            </div>
          </div>
          <div className="navbar-header pull-right">
            <a className={`${this.props.classes.logo} navbar-brand`} href="/">
              ARRAT
            </a>
          </div>
            {console.log("total Count " + this.props.totalCount.toString())}
          {this.props.showFilters ? 
          <div className={this.props.classes.SelectedFilters} style = {{position: 'relative', bottom: '0px'}} >
            <Paper className={this.props.classes.TotalCountBox} elevation={4} >

              <Typography type="body1" align="center" style={{ lineHeight: '1.4rem' }} >
                Report Count
              </Typography>
              <Typography type="subheading" align="center" style={{ lineHeight: '1.4rem' }} >
                {this.formatNumberWithCommas(this.props.totalCount)}
              </Typography>
            </Paper>
            <CurrentlySelectedFilters />

              <MaterialTooltip
                  title="Note: This does not clear the date range, it only sets it back to the most recent week of data."
                  placement="top"
                  enterDelay={50}
                  classes={{
                      tooltip: this.props.classes.tooltipStyle,
                      popper: this.props.classes.tooltipStyle,
                  }}
              >
                <Paper className={`${this.props.classes.filterPaper} pull-right`} onClick={this.handleClearFilters} style = {{
                    textAlign: 'center', cursor: 'pointer', display: 'inline-block', position: 'relative' , height : '37px'}} elevation={4}>

                    <Typography type="subheading" align="center" style={{   display: 'inline-block', lineHeight: '2.3rem' }} >
                        Clear Filters <span style = {{position: 'relative' , top: '3px', fontSize: '20px'}}> X </span>
                    </Typography>
                </Paper>
              </MaterialTooltip>
          </div>
          : null}
        </div>
      </nav>
    </div>
  )
}

const mapStateToProps = state => ({
  isLoggedIn: state.user.isLoggedIn,
  totalCount: state.demographic.totalCount,
});

export default connect(
  mapStateToProps,
  {
    setUserInfo,
    toggleSexFilter,
    toggleAgeFilter,
    toggleLocationFilter,
    toggleOccupationFilter,
    toggleMETypeFilter,
    toggleProductFilter,
    toggleStageFilter,
    toggleCauseFilter,
    setSelectedDate,
  },
)(withStyles(styles)(TopNavigation));
