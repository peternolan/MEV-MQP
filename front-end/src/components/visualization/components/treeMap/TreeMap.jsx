import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Treemap, Tooltip } from 'recharts';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { toggleMETypeFilter, toggleProductFilter, toggleStageFilter, toggleCauseFilter } from '../../../../actions/visualizationActions';
import ClearFilterIcon from '../../../../resources/clearFilterIcon.svg';
import CustomizedContent from './components/CustomizedContent';
import styles from './TreeMapStyles';
import CustomTooltip from './components/CustomTooltip';
import './TreeMap.css';

/**
 * This is the component for the TreeMap visualization
 */
class TreeMap extends Component {
  static propTypes = {
    toggleMETypeFilter: PropTypes.func.isRequired,
    toggleProductFilter: PropTypes.func.isRequired,
    toggleStageFilter: PropTypes.func.isRequired,
    toggleCauseFilter: PropTypes.func.isRequired,
    mainVisHeight: PropTypes.string.isRequired,
    classes: PropTypes.shape({
      mainVisualization: PropTypes.string,
      treemapVisualization: PropTypes.string,
      treemapLabel: PropTypes.string,
      treePaper: PropTypes.string,
      clearFilterChip: PropTypes.string,
      chipAvatar: PropTypes.string,
      treeMapColorLegend: PropTypes.string,
    }).isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      mainWidth: 1,
      treeMapHeight: 155,
      stillResizingTimer: '',
    };
  }

  componentDidMount() {
    // Once the screen has loaded, optimize the size of the TreeMap
    this.resizeGraph();

    // Listen for window resize, but wait till they have stopped to do the size calculations.
    window.addEventListener('resize', this.resizeTimer);

    // Resize the treemaps when the main-visualization size is changed
    document.getElementById('main-visualization').addEventListener('transitionend', this.resizeGraph);
  }

  componentWillUnmount() {
    // Remove the event listeners when unmounting
    window.removeEventListener('resize', this.resizeTimer);
    document.getElementById('main-visualization').removeEventListener('transitionend', this.resizeGraph);
  }

  /**
   * Generates a random integer between the two given values
   * @param {int} min
   * @param {int} max
   * @return {int} Random int between the Min and Max
   */
  getRandomInt = (min, max) =>
    (Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min));

  getMaxSerious = (type) => {
    if (this.props[type]) {
      return this.props[type].reduce((maxSerious, category) => {
        const numSerious = category.size - category.UNK;
        return (numSerious > maxSerious) ? numSerious : maxSerious;
      }, 1);
    }
    return 1;
  }

  /**
   * After 250ms of not resizing, we will then resize the graph (this improves performance)
   */
  resizeTimer = () => {
    clearTimeout(this.state.stillResizingTimer);
    this.setState({ stillResizingTimer: setTimeout(this.resizeGraph, 250) });
  }

  /**
   * Toggles the filter in Redux State for the bar clicked on in the chart
   */
  clearFilter = type => (e) => {
    switch (type) {
      case 'meType':
        this.props.toggleMETypeFilter('CLEAR');
        break;
      case 'product':
        this.props.toggleProductFilter('CLEAR');
        break;
      case 'stage':
        this.props.toggleStageFilter('CLEAR');
        break;
      case 'cause':
        this.props.toggleCauseFilter('CLEAR');
        break;
      default:
    }
  }

  /**
   * Toggles the filter in Redux State for the bar clicked on in the chart
   */
  handleFilterClickToggle = type => (e) => {
    if (e && e.name) {
      switch (type) {
        case 'meType':
          this.props.toggleMETypeFilter(e.name);
          break;
        case 'product':
          this.props.toggleProductFilter(e.name);
          break;
        case 'stage':
          this.props.toggleStageFilter(e.name);
          break;
        case 'cause':
          this.props.toggleCauseFilter(e.name);
          break;
        default:
      }
    }
  }

  /**
   * Calculates the best size for the visualization for better scalability
   */
  resizeGraph = () => {
    const firstTreeMap = document.getElementById('firstTreeMap');
    const firstTreeMapHeight = window.getComputedStyle(firstTreeMap, null).getPropertyValue('height');
    this.setState({
      treeMapHeight: parseInt(firstTreeMapHeight, 10) - 10,
      mainWidth: document.getElementById('main-visualization').getBoundingClientRect().width - 20,
    });
  }

  // style={{ fontSize: '13px', color: '#eee', textShadow: '0px 0px 8px #222' }}

  render = () => (
    <div
      id="main-visualization"
      className={this.props.classes.mainVisualization}
      style={{ height: this.props.mainVisHeight }}
    >
      <div className={this.props.classes.treeMapColorLegend}>
        <Typography
          type="button"
          className="pull-left"
          style={{
            fontSize: '13px',
            color: '#333',
            textShadow: '0px 0px 20px #222',
            transform: 'translateX(calc(-100% - 5px))',
          }}
        >
          Least Severe
        </Typography>
        <Typography
          type="button"
          style={{
            fontSize: '12px',
            color: '#eee',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            letterSpacing: '1px',
            position: 'absolute',
            left: '50%',
            width: 'fit-content',
            transform: 'translateX(-50%)',
          }}
        >
          Legend
        </Typography>
        <Typography
          type="button"
          className="pull-right"
          style={{
            fontSize: '13px',
            color: '#333',
            textShadow: '0px 0px 20px #222',
            transform: 'translateX(calc(100% + 5px))',
          }}
        >
          Most Severe
        </Typography>
      </div>
      <div className={`${this.props.classes.treemapVisualization} treeMapContainer`} id="firstTreeMap">
        <p className={`${this.props.classes.treemapLabel} treeMapLabel`}>Medication Error</p>
        <Chip
          avatar={<Avatar src={ClearFilterIcon} alt="Clear Filters" className={this.props.classes.chipAvatar} />}
          label="Clear Filter"
          onClick={this.clearFilter('meType')}
          className={this.props.classes.clearFilterChip}
        />
        <div className={this.props.classes.treePaper}>
          <Paper elevation={16}>
            <Treemap
              width={this.state.mainWidth}
              height={this.state.treeMapHeight}
              data={this.props.meType}
              dataKey="size"
              ratio={4 / 3}
              stroke="#ddd"
              fill="url(#colorSevere)"
              onClick={this.handleFilterClickToggle('meType')}
              content={<CustomizedContent highestSeriousCount={this.getMaxSerious('meType')} treeMap="meType" />}
              isAnimationActive={false}
              animationDuration={0}
            >
              <defs>
                <filter id="selectedShadow" filterUnits="userSpaceOnUse">
                  <feColorMatrix
                    type="matrix"
                    values="0 1 0 0 0
                            0 1 0 0 0
                            0 1 0 0 0
                            0 1 0 1 0 "
                  />
                </filter>
              </defs>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#424242', strokeWidth: 1 }}
                wrapperStyle={{ padding: '4px', zIndex: 1000 }}
              />
            </Treemap>
          </Paper>
        </div>
      </div>
      <div className={`${this.props.classes.treemapVisualization} treeMapContainer`}>
        <p className={`${this.props.classes.treemapLabel} treeMapLabel`}>Drug Name</p>
        <Chip
          avatar={<Avatar src={ClearFilterIcon} alt="Clear Filters" className={this.props.classes.chipAvatar} />}
          label="Clear Filter"
          onClick={this.clearFilter('product')}
          className={this.props.classes.clearFilterChip}
        />
        <div className={this.props.classes.treePaper}>
          <Paper elevation={16}>
            <Treemap
              width={this.state.mainWidth}
              height={this.state.treeMapHeight}
              data={this.props.product}
              dataKey="size"
              ratio={4 / 3}
              stroke="#ddd"
              fill="url(#colorSevere)"
              onClick={this.handleFilterClickToggle('product')}
              content={<CustomizedContent highestSeriousCount={this.getMaxSerious('product')} treeMap="product" />}
              isAnimationActive={false}
              animationDuration={0}
            >
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#424242', strokeWidth: 1 }}
                wrapperStyle={{ padding: '4px', zIndex: 1000 }}
              />
            </Treemap>
          </Paper>
        </div>
      </div>
      <div className={`${this.props.classes.treemapVisualization} treeMapContainer`}>
        <p className={`${this.props.classes.treemapLabel} treeMapLabel`}>Stage</p>
        <Chip
          avatar={<Avatar src={ClearFilterIcon} alt="Clear Filters" className={this.props.classes.chipAvatar} />}
          label="Clear Filter"
          onClick={this.clearFilter('stage')}
          className={this.props.classes.clearFilterChip}
        />
        <div className={this.props.classes.treePaper}>
          <Paper elevation={16}>
            <Treemap
              width={this.state.mainWidth}
              height={this.state.treeMapHeight}
              data={this.props.stage}
              dataKey="size"
              ratio={4 / 3}
              stroke="#ddd"
              fill="url(#colorSevere)"
              onClick={this.handleFilterClickToggle('stage')}
              content={<CustomizedContent highestSeriousCount={this.getMaxSerious('stage')} treeMap="stage" />}
              isAnimationActive={false}
              animationDuration={0}
            >
              <Tooltip
                content={<CustomTooltip treeMapHeight={this.state.treeMapHeight} />}
                cursor={{ stroke: '#424242', strokeWidth: 1 }}
                wrapperStyle={{ padding: '4px', zIndex: 1000, height: `${this.state.treeMapHeight}px` }}
              />
            </Treemap>
          </Paper>
        </div>
      </div>
      <div className={`${this.props.classes.treemapVisualization} treeMapContainer`}>
        <p className={`${this.props.classes.treemapLabel} treeMapLabel`}>Cause</p>
        <Chip
          avatar={<Avatar src={ClearFilterIcon} alt="Clear Filters" className={this.props.classes.chipAvatar} />}
          label="Clear Filter"
          onClick={this.clearFilter('cause')}
          className={this.props.classes.clearFilterChip}
        />
        <div className={this.props.classes.treePaper}>
          <Paper elevation={16}>
            <Treemap
              width={this.state.mainWidth}
              height={this.state.treeMapHeight}
              data={this.props.cause}
              dataKey="size"
              ratio={4 / 3}
              stroke="#ddd"
              fill="url(#colorSevere)"
              onClick={this.handleFilterClickToggle('cause')}
              content={<CustomizedContent highestSeriousCount={this.getMaxSerious('cause')} treeMap="cause" />}
              isAnimationActive={false}
              animationDuration={0}
            >
              <Tooltip
                content={<CustomTooltip treeMapHeight={this.state.treeMapHeight} />}
                cursor={{ stroke: '#424242', strokeWidth: 1 }}
                wrapperStyle={{ padding: '4px', zIndex: 1000, height: `${this.state.treeMapHeight}px` }}
              />
            </Treemap>
          </Paper>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  meType: state.mainVisualization.meType,
  product: state.mainVisualization.product,
  stage: state.mainVisualization.stage,
  cause: state.mainVisualization.cause,
});

/**
 * Conect this component to the Redux global State.
 * Maps Redux state to this comonent's props.
 * Gets Redux actions to be called in this component.
 * Exports this component with the proper JSS styles.
 */
export default withStyles(styles)(connect(mapStateToProps,{toggleMETypeFilter, toggleProductFilter, toggleStageFilter, toggleCauseFilter })(TreeMap));
