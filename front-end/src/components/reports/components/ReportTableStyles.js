export default {
  tableWrapper: {
    width: '100%',
    margin: '0',
    maxHeight: 'calc(100vh - 122px)',
    backgroundColor: '#fff',
    display: 'inline-block'
  },
  tableContainer: {
    margin: '0px',
    padding: '0px',
    width: 500,
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 172px)',
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
    width: 'calc(80% - 5px)',
    margin: '5px',
    marginRight: 0,
    display: 'inline-block',
    height: 35,
    padding: '10px',
    float: 'left'
  },
  searchDD: {
    height: 35,
    width: 'calc(20% - 5px)',
    boxShadow: 'none',
    borderColor: 'rgba(51, 51, 51, 0.08)',
    float: 'left',
    margin: 5,
    marginLeft: 0,
    borderRadius: 0,
  }
};
