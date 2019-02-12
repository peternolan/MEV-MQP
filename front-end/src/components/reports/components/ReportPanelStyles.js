export default {
    summaryContainer: {
        overflow: 'hidden',
        height: 'calc(100vh - 122px)',
        borderRadius: 0,
        borderLeftWidth: '1px',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderColor: 'rgba(0, 0, 0, 0.08)',
        borderStyle: 'solid',
        fontFamily: 'Roboto',
        width: '100%',
    },
    expansionPanelSummary: {
        justifyContent: 'center',
    },
    summaryTitle: {
        fontSize: '12px',
        position: 'relative',
        borderRadius: 0,
        display: 'flex',
    },
    hideBtn: {
        //float: 'right',
        padding: 3,
        color: '#1D1F83',
        cursor: 'pointer',
        width: 'auto',
        display: 'flex',
        alignItems: 'center',
        lineHeight: 'default',
        '&:hover':{
            textDecorationLine: 'underline',
            cursor: 'pointer'
        },
    },
    summarySummary: {
        paddingTop: 0,
        paddingLeft: 25,
        width: '100%',
        maxHeight: '10vh',
        height: 'auto',
        overflow: 'scroll',
    },
    legend: {
        width: '20%',
        height: 'auto',
        backgroundColor: '#F5F5F5',
        
    },


/*
    export default {
        drug: 'chartreuse',
        reaction: 'cadetblue',
        dosage: 'darkorange',
        age: 'gold',
        sex: 'lightpink',
        weight: 'orchid',
        indication: 'silver',
        interesting: 'cyan',
        clear: 'white',
        edit: 'black'
    };
*/


};
