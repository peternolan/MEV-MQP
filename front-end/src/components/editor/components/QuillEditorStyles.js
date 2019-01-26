import green from 'material-ui/colors/green';
import grey from 'material-ui/colors/grey';

export default {
  pdfView: {
    width: '100%',
    height: '560px',
    margin: 'auto',
    padding: '10px',
  },
    commentSec: {
        position: 'absolute',
        width: '98.5%',
        elevation: '4',
        transition: '0.4s',
        bottom: '0',
    },

    commentButton: {

        background: 'none',
        color: '#1317f2',
        cursor: 'pointer',
        padding: '5px',
        width: '98.5%',
        border: 'none',
        fontSize: '8px',

    },

    commentContent: {
      padding: '0 0px',
        display: 'none',
        overflow: 'hidden',

    },

  dialog: {
    width: '100%',
    padding: '0px 20px 0px 20px',
  },
  editorWindow: {
    height: '60vh',
  },
  paperWindow: {
    height: 'calc(77% + 44px)',
  },
  legend: {
    width: '20vw',
    height: '66vh',
    padding: '1px',
  },
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: 10,
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: grey[400],
    '&:hover': {
      backgroundColor: grey[500],
    },
  },

  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    marginLeft: 5,
  },

    squareCadetBlue: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'chartreuse',

    },
    squareReuse: {

        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'cadetblue',


    },
    squareOrange: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'darkorange',
        textAlign: 'right',

    },
    squareGold: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'gold',
        textAlign: 'right',

    },
    squarePink: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'lightpink',
        textAlign: 'right',

    },
    squareOrchid: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'orchid',
        textAlign: 'right',

    },
    squareSilver: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'silver',
        textAlign: 'right',

    },
    squareCyan: {
        display: 'inline-block',
        width: '20px',
        height: '20px',
        margin: '3px',
        backgroundColor: 'cyan',
        textAlign: 'right',

    },

    toolTipStyle: {
        position: 'relative',
        display: 'inline-block',
        borderBottom: '1px dotted black',
        fontSize: '12px',
    },

/*
    toolTip: {
      position: 'relative',
      display: 'inline-block',
        borderBottom: '1px dotted black',
    },

    toolTipText: {

      visibility: 'hidden',
        width: '120px',
        backgroundColor: '#555',
        color: '#fff',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '5px 0',
        position: 'absolute',
        zIndex: '1',
        bottom: '125%',
        left: '50%',
        marginLeft: '-60px',
        opacity: '0',
        transition: 'opacity 0.3s'
    },

    toolTipAfter: {
      content: '',
        position: 'absolute',
        top: '100%',
        left: '50%',
        marginLeft: '-5px',
        borderWidth: '5px',
        borderStyle: 'solid',
        borderColor: '#555 transparent transparent transparent',

    }
*/

};
