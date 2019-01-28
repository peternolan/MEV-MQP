import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import { getReportNarrativeFromID, htmlEncode, htmlUnescape, getComment } from '../../../actions/reportActions';
import styles from "./ReportPanelStyles";
import Highlighter from "react-highlight-words";
import Typography from "material-ui/Typography/Typography";
import QuillEditor from "../../editor/components/QuillEditor";
import {Collapse} from 'react-collapse';
//import CaseIcon from '../../../resources/CaseIcon';

class ReportPanel extends React.PureComponent {

    static propTypes = {
        getReportNarrativeFromID: PropTypes.func.isRequired,
        htmlEncode: PropTypes.func.isRequired,
        htmlUnescape: PropTypes.func.isRequired,
        incrementSummary: PropTypes.func,
        classes: PropTypes.shape({
            pdfView: PropTypes.string,
            editorWindow: PropTypes.string,
            paperWindow: PropTypes.string,
            root: PropTypes.string,
            wrapper: PropTypes.string,
            buttonSuccess: PropTypes.string,
            buttonProgress: PropTypes.string,
            hideBtn: PropTypes.string,
        }).isRequired,
        primaryid: PropTypes.number,
        userID: PropTypes.number.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string,
            }),
        }),
    };

    static defaultProps = {
        match: {},
        primaryid: null,
        incrementSummary: () => {},
    };

    constructor(props){

        super(props);
        this.state = {
            searching:false,
            valueAttr:'Search..',
            addingComment: false,
            loading: true,
            editModeOn: false,
            primaryId: this.props.primaryid,
            userID: this.props.userID,
            summaryToggleText: 'Hide',
            current: {
                reportText: '',
                tags: [],
            },
            saved: {
                reportText: '',
                tags: [],
            },
            textHighlight:{
                searchText:'    ',
                textToHighlight:'FDA contacted the patient for follow-up after',
                activeIndex: -1,
                caseSensitive: false
            },
            summaryShown: true,
        };
    };

    componentWillMount() {
        if (this.props.match.params) {
            this.getTextFromID(Number(this.props.match.params.id, 10));
        } else {
            console.log(this.props.primaryid);
            this.getTextFromID(this.props.primaryid);
        }
    }

    componentDidMount() {
        // Auto save the text every 10 seocnds
        window.addEventListener('beforeunload', this.onUnload);
        // this.autosave = setInterval(() => this.saveWork(), 10000);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onUnload);
        // clearInterval(this.autosave);
    }

    onUnload = () => this.saveWork();

    getTextFromID = (id) => {
        if (isNaN(id)) {
            this.setState({
                saving: true,
                success: false,
                loading: false,
            });
        } else {
            this.props.getReportNarrativeFromID(id)
                .then((rows) => {
                    if (rows.length > 0) {
                        this.setState({
                            saving: false,
                            success: true,
                            loading: false,
                            current: {
                                reportText: rows[0].report_text,
                                tags: rows[0].tags,
                            },
                            saved: {
                                reportText: rows[0].report_text,
                                tags: rows[0].tags,
                            },
                        });
                    } else {
                        this.setState({
                            saving: true,
                            success: false,
                            loading: false,
                        });
                    }
                });
        }

    };

    handleHideSummary = () => {
        if(this.state.summaryToggleText === 'Hide'){
                return this.setState({summaryShown: !this.state.summaryShown, summaryToggleText: 'Show'})
        } else {
            this.setState({summaryShown: !this.state.summaryShown,  summaryToggleText: 'Hide'})
        }
    };

    renderInside = (primaryID) => {
        return (
            <div key={primaryID}>
                <Collapse isOpened={this.state.summaryShown}>
                    <div className={this.props.classes.summarySummary}>
                        <Typography>Cupcake ipsum dolor sit amet gingerbread marzipan cookie topping. Chocolate bar toffee carrot cake ice cream lollipop carrot cake tootsie roll. Sesame snaps marzipan carrot cake gummies cake croissant topping tart. Lollipop bear claw brownie halvah liquorice tiramisu. Oat cake muffin jelly caramels biscuit sugar plum cookie tart oat cake. Candy canes powder cheesecake sweet roll fruitcake jujubes lollipop bear claw.</Typography>
                    </div>
                </Collapse>
                <Divider />
                <div>
                    {(!this.state.searching)
                        ? (<div>
                            <QuillEditor
                            primaryid={Number(primaryID)}
                            incrementSummary={this.props.incrementSummary}
                            userEmail={this.props.userEmail}
                            match={this.props.match}
                            />

                        </div>)
                        : (
                            <Highlighter
                                activeClassName={styles.Active}
                                activeIndex={this.state.textHighlight.activeIndex}
                                caseSensitive={this.state.textHighlightcaseSensitive}
                                highlightClassName={styles.Highlight}
                                highlightStyle={{ fontWeight: 'normal', backgroundColor : '#ffd54f' }}
                            />
                            )
                        }
                    </div>
            </div>
        );
    };

    render = () => {
        return (
            <Paper id="summary-container" className={this.props.classes.summaryContainer} elevation={4}>
                <Paper id='summarytitle' className={this.props.classes.summaryTitle}><Typography type="title">Report {this.props.primaryid}<div onClick={this.handleHideSummary} className={this.props.classes.hideBtn}><Typography type='button'>{this.state.summaryToggleText} Summary</Typography></div></Typography></Paper>
                {this.renderInside(this.props.primaryid)}
                <Paper id='commentsection' className={this.props.classes.commentSection}></Paper>
            </Paper>
        );
    }

}

const mapStateToProps = state => ({
    userID: state.user.userID,
});

export default connect(
    mapStateToProps,
    { getReportNarrativeFromID,
        htmlEncode,
        htmlUnescape,
        getComment,},
)(withStyles(styles)(ReportPanel));