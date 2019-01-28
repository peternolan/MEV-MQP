import green from 'material-ui/colors/green';
import grey from 'material-ui/colors/grey';
export default {
    pdfView: {
        width: '100%',
        height: 'calc(98vh - 220px)',
        margin: 0,
        overflow : 'auto'
    },
    commentSec: {
        position: 'absolute',
        width: '98.5%',
        elevation: '4',
        transition: '0.4s',
        bottom: '0',
        background: 'white',
        zIndex: '3',
        overflow : 'auto'
    },
    quillArea: {
        width: '100%',
        margin: 0,
        overflow: 'auto',
        zIndex: '-1'
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
    textButton:{
        color: '#1D1F83',
    },
    legend: {
        display: 'inline-block',
        backgroundColor: '#fff' ,
        bottom: 0,
        width: 100,
        height: 'auto',
        listStyleType: 'none',
        float: 'right',
        margin: 0,
        padding: 2,
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
    legendSquare: {
        width: 10,
        height: 10,
        display: 'inline-block',
        position: 'relative',
        marginRight: 5,
    },
    legendPair: {
        display: 'flex',
        //justifyContent: 'center',
        alignItems: 'center',
    },
    toolTipStyle: {
        position: 'relative',
        display: 'inline-block',
        borderBottom: '1px dotted black',
        fontSize: '12px',
    },
    commentButton: {
        background: 'white',
        color: '#1317f2',
        cursor: 'pointer',
        padding: '5px',
        width: '98.5%',
        border: 'white',
        textAlign: 'left'
    },
    commentContent: {
        padding: '0 0px',
        display: 'none',
        overflow: 'auto',
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
