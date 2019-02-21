export default {
	bargraph: {
		width: 'calc(100% - 8)',
		height: 75,
		margin: 4,
		marginBottom: 20,
	},
	dataSelector: {
		marginLeft: '7%',
	},
	summaryContent: {
		width: '100%',
		height: 'auto',
		//overflow: 'scroll',
	},
	reportBox: {
		padding: 5,
		position: 'relative',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
	},
	countText: {
		fontSize: 14,
	},
	caseBDText: {
		marginLeft: 10,
		color: 'rgba(0,0,0,.7)',
	},
	recString: {
		borderWidth: 0,
		borderBottomWidth: 1,
		width: 'calc(100% - 8px)',
		fontSize: 12,
	},
	keywordHead: {
		position: 'relative',
		display: 'flex',
		flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        margin: 0,
        height: 30,
        backgroundColor: '#dbf0ff',
        borderWidth: 0,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(0,0,0,.25)',
	},
	textButton: {
		color: '#1D1F83',
		margin: 5,
        '&:hover': {
        	cursor: 'pointer',
        }
	},
	recButton: {
		display: 'flex',
		alignItems: 'center',
		fontSize: 12,
		color: '#1D1F83',
		margin: 0,
		height: 30,
		marginLeft: '15%',
		'&:hover': {
        	cursor: 'pointer',
        	color: '#fff',
        }
	},
	caseButton: {
		marginLeft: '5%',
		color: '#1D1F83',
        '&:hover':{
        	cursor: 'pointer',
        	textDecoration: 'underline',
        },
	},
	keywordContainer: {
		height: 'auto',
		width: 'auto',
		padding: 10,
	},
	keywordCapsule: {
		display: 'inline-block',
		height: 'auto',
		width: 'auto',
		margin: 2,
		padding: 4,
		opacity: .7,
		borderRadius: 15,
		'&:hover':{
			cursor: 'pointer',
		},
	},
	topButton: {
		width: '50%',
		display: 'inline-block',
	},
}