export default {
  tableWrapper: {
    maxHeight: '82vh',
    width: '35vw',
    margin: '0',
    borderWidth: '4px',
    borderColor: '#aaa',
    backgroundColor: '#fff',
    display: 'border-box'
  },
  tableContainer: {
    margin: '0px',
    padding: '0px',
    width: 'calc(100%-2px)',
    maxHeight: '77vh',
    overflow: 'scroll',
    display: 'inline-block'
  },
  moveToCaseDetailsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: '#fefefe',
    padding: '0px 15px',
  },
  caseGridList: {
    padding: '5px',
    margin: '5px',
    width: 'auto',
    height: 'auto',
  },
  sendToCaseContainer: {
    position: 'relative',
  },
  tableDetailCell: {
    background: 'repeating-linear-gradient( -55deg, #fafafa 0px, #fafafa 30px, #f1f1f1 30px, #f1f1f1 50px)',
    padding: '12px 24px',
  },
  tooltipStyle: {
    fontSize: '10pt',
    'pointer-events': 'none',
  },
  searchBar: {
    fontSize: '1em',
    width: 'calc(100% - 6px)',
    margin: '2px',
    display: 'inline-block',
    height: '40px',
    padding: '5px',
  }
};
