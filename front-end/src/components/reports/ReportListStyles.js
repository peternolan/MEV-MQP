import ReportPanel from "./components/ReportPanel";
import React from "react";

export default {
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
    maxheight: 'calc(100% - 122px)',
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
      width: 500, /* This element is constantly on the screen, so we want it's width to be pretty much static. */
      maxHeight: 'calc(100vh - 122px)',
      padding: '0px',
      margin: '0px',
      transition: 'width 200ms ease-in-out',
      backgroundColor: '#fff',
  },
  /* The only variable elements should be the report and summary panels, when the case summary expands the report should shrink to accomodate. */
  /*.Case summary panel styles */
  openSummaryContainer: {
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
    width: '0vw',
    maxHeight: 'calc(100vh - 122px)',
    height: 'calc(100vh - 122px)',
    transition: 'width 200ms ease-in-out',
    overflow: 'hidden',
  },
  /* Report panel styles */
  reportContainer: {
      float: 'right',
      display: 'inline-block',
      width: 'auto',
      maxWidth: 'calc(100vw - 500px)',
      maxHeight: 'calc(100vh - 122px)',
      height: '100%',
      padding: '0px',
      transition: 'width 200ms ease-in-out',
      overflow: 'scroll',
  },
  smallreportContainer: {
        float: 'right',
        display: 'inline-block',
        maxWidth: 'calc(76vw - 500px)',
        maxHeight: 'calc(100vh - 122px)',
        height: '100%',
        padding: '0px',
        transition: 'width 200ms ease-in-out',
        boxShadow: 'none'
  },
  borderBottom: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.25)',
  }
};
