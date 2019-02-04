export default {
	bargraph: {
		width: 'calc(20vw - 8)',
		margin: 4,
	},
	dataSelector: {
		float: 'right',
		marginRight: 0,
	},
	summaryContent: {
		width: '100%',
		maxHeight: '40vh',
		overflow: 'scroll',
	},
	textButton: {
		color: '#1D1F83',
        cursor: 'pointer',
        marginLeft: 10,
	},
	keywordCapsule: {
		display: 'inline-block',
		height: 'auto',
		width: 'auto',
		backgroundColor: '#dbf0ff',
		marginRight: 3,
		padding: 2,
		borderRadius: 3,
		'&:hover':{
			cursor: 'pointer'
		}
	},
	keywordContainer: {
		paddingLeft: 10,
		marginBottom: 5,
		overflow: 'wrap',
	}
}