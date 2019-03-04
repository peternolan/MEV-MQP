import green from '@material-ui/core/colors/green';
import grey from '@material-ui/core/colors/grey';
export default {
    pdfView: {
        maxWidth: '100%',
        margin: 0,
        overflow : 'auto',
        padding: 0,
        position: 'relative',
        display: 'block'
    },
    textButton: {
        color: '#1D1F83',
        '&:hover': {
            cursor: 'pointer',
        }
    },
    commentSec: {
        width: '100%',
        margin: 0,
        padding: 0,
        bottom: 0,
        position: 'absolute',
        backgroundColor: '#fff',
    },
    quillArea: {
        width: '100%',
        margin: 0,
        overflow: 'hidden',
        zIndex: 1,
        borderColor:'white'
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
    editBtn: {
        fontSize: 12,
        padding: 3,
        color: '#1D1F83',
        cursor: 'pointer',
        alignItems: 'center',
        lineHeight: 'default',
        '&:hover':{
            textDecorationLine: 'underline',
            cursor: 'pointer'
        },
    },
    /* Container for the edit and save buttons */
    editFacet: {
        display: 'inline-block',
        width: '100%',
        maxHeight: 20,
        padding: 5,
        fontSize: 12,
        color: '#1D1F83',
        overflow: 'hidden',
    },
    editBox: {
        marginLeft: 20,
        display: 'inline-block',
        float: 'right',
        width: '8vw',
        transition: 'width 400ms ease-in-out',
        cursor: 'pointer',
        '&:hover':{
            textDecorationLine: 'underline',
            cursor: 'pointer'
        },

    },

    saveBox: {
        display: 'inline-block',
        float: 'right',
        width: '8vw',
        transition: 'width 400ms ease-in-out',
        cursor: 'pointer',
        '&:hover': {
            textDecorationLine: 'underline',
            cursor: 'pointer'
        },
    },
    noBox: {
        display: 'inline-block',
        float: 'right',
        width: 0,
        overflow: 'hidden',
        transition: 'width 400ms ease-in-out',
    },
    /* Container for the legend */
    legend: {
        display: 'inline-flex',
        width: '100%',
        height: 'auto',
        margin: 0,
        overflow: 'wrap',
    },
    wrapper: {
        margin: 10,
        position: 'relative',
        //overflow: 'scroll',
    },
    /* Not aprticularly useful */
    quillText: {
        overflow: 'scroll',
        height: 'auto',
        maxHeight: '70vh',
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
    legendEntry: { /* The container for the text and squares. */
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
        height: 20,
        paddingLeft: 10,
        paddingRight: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, .25)',
        borderRadius: 0,
        marginLeft: '1vw',
    },
    highlightButtons: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '10%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, .25)',
        borderRadius: 0,
    },
    toolTipStyle: {
        position: 'relative',
        display: 'inline-block',
        borderBottom: '1px dotted black',
        fontSize: '12px',
    },
    /*  Inside of the comment collapse */
    commentContent: {
        margin: 0,
        padding: '0 0px',
        display: 'flex',
        overflow: 'auto',
        backgroundColor: '#fff',
    },
    /* Comment button styles */
    commentBtn: {
        margin: 0,
        padding: 10,
        display: 'flex',
        backgroundColor: '#dbf0ff',
        alignItems: 'center',
        cursor: 'pointer',
        borderBottom: '1px rgba(0, 0, 0, 0.25) solid',
        borderTop: '1px rgba(0, 0, 0, 0.25) solid',
        '&:hover':{
            backgroundColor: '#dbf0ff'
        }        
    },

    toolbar: {
        top: 0,
        zIndex: 4,
        position: 'sticky',
        backgroundColor: '#fff',
    }
};
