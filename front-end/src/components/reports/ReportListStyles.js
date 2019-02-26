export default {
  collapseDivider: {
    height: 'calc(100vh - 122px)',
    width: 15,
    backgroundColor: '#1D1F83',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover':{
      cursor: 'pointer',
      backgroundColor: '#7c88c1',
    }
  },
  collapseTri: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '8px 0 8px 8px',
    borderColor: 'transparent transparent transparent #fff',
    transform: 'rotate(0deg)',
    transition: 'all 500ms ease-in-out',
  },
  inverseTri: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '8px 0 8px 8px',
    borderColor: 'transparent transparent transparent #fff',
    transform: 'rotate(180deg)',
    transition: 'all 500ms ease-in-out',
  },
  newCaseArea: {
    width: 'calc(100%)',
    margin: '20px',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    bottom: '0px',
  },
  goToVisualizationSVG: {
    position: 'absolute',
    float: 'left',
    width: '35px',
    height: '35px',
  },
  caseSummarySVG: {
    position: 'absolute',
    float: 'right',
    width: '35px',
    height: '35px',
    transform: 'translateX(2px)',
  },
  tooltipStyle: {
    fontSize: '10pt',
    'pointer-events': 'none',
    float: 'right',
  },
  ReportList: {
    maxHeight: 'calc(100vh - 122px)',
    maxWidth: '100vw',
    display: 'inline-block',
    boxShadow: 'none'
  },
  newCaseModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    width: '600px',
  },
  /* Table styles */
  tableContainer: {
      float: 'left',
      display: 'inline-block',
      width: 470, /* This element is constantly on the screen, so we want it's width to be pretty much static. */
      maxHeight: 'calc(100vh - 122px)',
      padding: '0px',
      margin: '0px',
      transition: 'width 200ms ease-in-out',
      backgroundColor: '#fff',
  },
  /* The only variable elements should be the report and summary panels, when the case summary expands the report should shrink to accomodate. */
  /*.Case summary panel styles */
largeSummaryContainer: {
  float: 'left',
  display: 'inline-block',
  width: 'calc(100vw - 500px)',
  height: 'calc(100vh - 122px)',
  transition: 'width 200ms ease-in-out',
},
smallSummaryContainer: {
      float: 'left',
      display: 'inline-block',
      width: '24vw',
      maxHeight: 'calc(100vh - 122px)',
      height: 'calc(100vh - 122px)',
      transition: 'width 200ms ease-in-out',
  },
  closedSummaryContainer: {
    float: 'left',
    display: 'inline-block',
    width: 0,
    maxHeight: 'calc(100vh - 122px)',
    height: 'calc(100vh - 122px)',
    transition: 'width 200ms ease-in-out',
    overflow: 'hidden',
  },
  /* Report panel styles */
  largeReportContainer: {
      float: 'right',
      display: 'inline-block',
      maxWidth: 'calc(100vw - 500px)',
      maxHeight: 'calc(100vh - 122px)',
      height: '100%',
      padding: '0px',
      transition: 'width 200ms ease-in-out',
      overflow: 'scroll',
  },
  smallReportContainer: {
        float: 'right',
        display: 'inline-block',
        width: 'calc(76vw - 500px)',
        maxHeight: 'calc(100vh - 122px)',
        height: '100%',
        padding: '0px',
        transition: 'width 200ms ease-in-out',
        boxShadow: 'none'
  },
  closedReportContainer:{
    float:'right',
    display: 'inline-block',
    width: 0,
    maxHeight: 'calc(100vh - 122px)',
    height: 'calc(100vh - 122px)',
    transition: 'width 200ms ease-in-out',
    overflow: 'hidden',
  },
  borderBottom: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.25)',
  }
};
