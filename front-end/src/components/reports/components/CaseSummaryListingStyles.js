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
    borderColor: 'rgba(0, 0, 0, 0.25)',
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
  borderBottom: {
    display: 'inline-block',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.25)',
  }, 
};
