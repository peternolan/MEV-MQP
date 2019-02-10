import green from 'material-ui/colors/green';
import grey from 'material-ui/colors/grey';
export default {
    pdfView: {
        maxWidth: '100%',
        height: 'auto',
        margin: 0,
        overflow : 'hidden',
        padding: 0,
    },
    commentSec: {
        width: '100%',
        margin: 0,
        padding: 0,
        bottom: 0,
        height: 'auto',
        position: 'absolute',
        backgroundColor: '#fff',
    },
    quillArea: {
        width: '100%',
        margin: 0,
        overflow: 'hidden',
        zIndex: '-1',
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
    /* Generic Text Button Style */
    textButton:{
        color: '#1D1F83',
        cursor: 'pointer',
        backgroundColor: '#dbf0ff',
        margin: '2px'

    },


    /* Container for the edit and save buttons */
    editFacet: {
        marginBottom: 0,
        width: 'auto',
        height: 'auto',
    },
    /* Container for the legend */
    legend: {
        display: 'inline-block',
        width: '100%',
        height: 'auto',
        margin: 0,
    },
    legendHidden: {
        display: 'none',
        width: 0,
        overflow: 'hidden',
    },
    wrapper: {
        margin: 10,
        position: 'relative',
        overflow: 'scroll',
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
        '&:hover':{
            backgroundColor: '#dbf0ff'
        }        
    }
};
