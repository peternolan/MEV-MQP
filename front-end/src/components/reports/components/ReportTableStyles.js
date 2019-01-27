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
    width: '75%',
    margin: 5,
    display: 'inline-block',
    height: 24,
    padding: 10,
    float: 'left',
    borderWidth: 1,
    borderRadius: 6,
    boxShadow: 'none',
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
  searchDD: {
    height: 25,
    width: '20%',
    float: 'left',
    marginLeft: 'calc(5% - 15px)',
    margin: 5,
  }
};
