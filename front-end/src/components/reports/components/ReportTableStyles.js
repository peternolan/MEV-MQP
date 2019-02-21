export default {
  tableWrapper: {
    width: '100%',
    margin: '0',
    backgroundColor: '#fff',
    display: 'inline-block'
  },
  tableContainer: {
    margin: '0px',
    padding: '0px',
    width: 470,
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 165px)',
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
  tableHeader: {
    maxHeight: 45,
  },
  caseGridList: {
    padding: '5px',
  },
  sendToCaseContainer: {
    position: 'relative',
  },
  tableDetailCell: {
    background: 'repeating-linear-gradient( -55deg, #fafafa 0px, #fafafa 30px, #f1f1f1 30px, #f1f1f1 50px)',
    padding: '12px 24px',
  },
  ellipsisFrame: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,.25)',
    height: '100%',
    width: '100%',
  },
  tooltipStyle: {
    fontSize: '10pt',
    'pointer-events': 'none',
  },
  searchBar: {
    fontSize: '1em',
    width: 'calc(80% - 5px)',
    margin: 5,
    marginRight: 0,
    display: 'inline-block',
    height: 25,
    padding: 10,
    float: 'left',
    borderWidth: 1,
    borderRadius: 0,
    boxShadow: 'none',
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
  searchDD: {
    height: 25,
    width: 'calc(20% - 5px)',
    float: 'left',
    margin: 5,
    marginLeft: 0,
    borderRadius: 0,
    borderWidth: 1,
  }
};
