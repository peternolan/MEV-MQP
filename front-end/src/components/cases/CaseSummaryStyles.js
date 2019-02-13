export default {
	bargraph: {
		width: 'calc(100% - 8)',
		height: 75,
		margin: 4,
		marginBottom: 20,
	},
	dataSelector: {
		float: 'right',
		marginRight: 0,
	},
	summaryContent: {
		width: '100%',
		height: 'auto',
		//overflow: 'scroll',
	},
	textButton: {
		color: '#1D1F83',
        cursor: 'pointer',
        margin: 0,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: '#dbf0ff',
        borderWidth: 0,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(0,0,0,.25)',
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