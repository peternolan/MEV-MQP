export default {
  summaryContainer: {
    height: '100%',
    margin: '0px',
    overflow: 'scroll',
    borderRadius: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: '1px',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderStyle: 'solid'
  },
  expansionTitle: {
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
    paddingLeft: 13,
    height: 56,
    backgroundColor: '#fff',
    '&:hover':{
      backgroundColor: '#dbf0ff',
      cursor: 'pointer'
    },
  },
  caseEntry: {
    borderStyle: 'solid',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  }
};
