import React, { Component } from 'react';
import 'react-quill/dist/quill.snow.css';
import Button from 'material-ui/Button';
import MaterialTooltip from 'material-ui/Tooltip';
import DeleteIcon from '../../../resources/Delete.svg';
import {connect} from "react-redux";
import {withStyles} from "material-ui";
import styles from "../../editor/components/QuillEditorStyles";
import {getComment, getReportNarrativeFromID, htmlEncode, htmlUnescape} from "../../../actions/reportActions";
import PropTypes from "prop-types";
import Paper from "./ReportPanel";


class CommentPanel extends Component {

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
            squareCadetBlue: PropTypes.string,
            squareReuse: PropTypes.string,
            squareOrange: PropTypes.string,
            squareGold: PropTypes.string,
            squarePink: PropTypes.string,
            squareOrchid: PropTypes.string,
            squareSilver: PropTypes.string,
            squareCyan: PropTypes.string,
            toolTipStyle: PropTypes.string,
            newCaseModal: PropTypes.string,
            commentSec: PropTypes.string,
        }).isRequired,
        primaryid: PropTypes.number,
        userID: PropTypes.number.isRequired,
        userEmail: PropTypes.string,
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string,
            }),
        }),
    };

    constructor(props) {

        super(props);

    }

    render() {
        console.log("commentsOn " + this.state.commentsOn);

        return (

            <Paper id="commentArea-container" className={this.props.classes.summaryContainer} padding = '0px' elevation={4}>
           <div className={this.props.classes.commentSec}>
                <button onClick={() => this.showComments()}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#282bfc',
                            display: (this.state.commentsOn) ? 'none' : 'block'
                        }}>
                    View Comments
                </button>
                <div style={{display: (this.state.commentsOn) ? 'block' : 'none'}}>
                    <button onClick={() => this.showComments()} style={{
                        background: 'none',
                        border: 'none',
                        color: '#282bfc',
                        display: (this.state.commentsOn) ? 'block' : 'none'}}>
                        Hide Comments
                    </button>
                    <div id="commentsView">
                        <h1>Comments</h1>
                        <div id="commentList">

                        </div>
                    </div>
                    <div style={{padding: '4px'}}>
                        <textarea id="comment" cols="120" rows="5">  </textarea>
                    </div>

                    <div style={{padding: '4px'}}>
                        <form id="radio-form">
                            <input type="radio" name="viewable" value="private" checked="yes" style={{padding: '4px'}}/>Private
                            <input type="radio" name="viewable" value="public" style={{padding: '4px'}}/>Public
                        </form>

                        <Button id="MakeNote" style={{border: '2px solid #1d00ff', left: '30px'}}
                                onClick={() => this.commentMade()}> Make Note </Button>

                        <MaterialTooltip
                            title="Delete Comment"
                            placement="top"
                            enterDelay={50}
                            classes={{
                                tooltip: this.props.classes.toolTipStyle,
                                popper: this.props.classes.tooltipStyle,
                            }}
                            style={{fontSize: '20pt',}}
                        >
                            <button id="delete" style={{
                                borderRadius: '20px',
                                position: 'relative',
                                left: '720px',
                                border: '2px solid #ff0000'
                            }} onClick={() => this.commentDelete()}>
                                <img src={DeleteIcon} style={{width: '15px', height: '20px'}}/>
                            </button>
                        </MaterialTooltip>
                        <Button
                            id="saveButton2"
                            raised
                            color="primary"
                            className={(this.state.success) ? this.props.classes.buttonSuccess : ''}
                            disabled={this.state.saving}
                            onClick={this.saveWork}>
                            Save
                        </Button>
                    </div>
                </div>
           </div>
            </Paper>

        );

    }
}

export default connect(

    { getReportNarrativeFromID,
        htmlEncode,
        htmlUnescape,
        getComment,},

)(withStyles(styles)(CommentPanel));
