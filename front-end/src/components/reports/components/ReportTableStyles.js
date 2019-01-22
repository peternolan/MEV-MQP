export default {
  tableWrapper: {
    width: '35vw',
    margin: '0',
    maxHeight: 'calc(100vh - 122px)',
    borderRightWidth: '4px',
    borderColor: '#aaa',
    backgroundColor: '#fff',
    display: 'inline-block'
  },
  tableContainer: {
    margin: '0px',
    padding: '0px',
    width: 'calc(100%-2px)',
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
    width: 'calc(100% - 10px)',
    margin: '5px',
    display: 'inline-block',
    height: '40px',
    padding: '10px',
  },
};
