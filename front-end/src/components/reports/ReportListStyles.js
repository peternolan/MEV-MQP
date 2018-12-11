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
    height: 'calc(100vh - 162px)',
  },
  newCaseModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    width: '600px',
  },
  closedSummaryTableContainer: {
    display: 'inline-block',
    width: '100%',
    height: '100%',
    transition: 'width 200ms ease-in-out',
  },
  closedSummaryContainer: {
    display: 'inline-block',
    float: 'right',
    width: '0%',
    height: '100%',
    transition: 'width 200ms ease-in-out',
    overflow: 'hidden',
  },

  openSummaryTableContainer: {
    display: 'inline-block',
    width: '50%',
    height: '100%',
    transition: 'width 200ms ease-in-out',
  },
    tableContainer: {
        display: 'inline-block',
        width: '60%',
        height: '100%',
        padding: '0px',
        margin: '0px',
        transition: 'width 200ms ease-in-out',
    },

  openSummaryContainer: {
    display: 'inline-block',
    float: 'right',
    width: '50%',
    height: '100%',
    transition: 'width 200ms ease-in-out',
  },
    reportContainer: {
        display: 'inline-block',
        float: 'left',
        width: '40%',
        height: '100%',
        padding: '0px',
        transition: 'width 200ms ease-in-out',
    },


};
