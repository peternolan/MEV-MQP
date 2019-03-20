import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes, {string} from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress  from '@material-ui/core/CircularProgress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Paper from '@material-ui/core/Paper';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import { getReportNarrativeFromID, htmlEncode, htmlUnescape} from '../../../actions/reportActions';
import styles from './QuillEditorStyles';
import annotationColors from './AnnotationColors';
import Highlighter from 'react-highlight-words';
import MaterialTooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import './NarrativeAnnotator.css';
import CustomTooltip from "../../visualization/components/demographics/components/ReportedBy";
import {Link} from "react-router-dom";
import GoToVisualizationIcon from "../../../resources/goToVisualizationIcon.svg";
import ViewCaseSummary from "../../../resources/caseSummary.svg";
import DeleteIcon from '../../../resources/Delete.svg';
import {Collapse} from 'react-collapse';

class QuillEditor extends Component {

    static propTypes = {
        getReportNarrativeFromID: PropTypes.func.isRequired,
        htmlEncode: PropTypes.func.isRequired,
        htmlUnescape: PropTypes.func.isRequired,
        incrementSummary: PropTypes.func,
        commentsOn: PropTypes.func, //Is comments section open or closed?
        summaryOn: PropTypes.bool, //Is the summary section opened or closed?
        refreshCases: PropTypes.func,
        classes: PropTypes.shape({ //Contains styles from QuillEdirtorStyles.js
            pdfView: PropTypes.string,
            editorWindow: PropTypes.string,
            paperWindow: PropTypes.string,
            toolbar: PropTypes.string,
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
            commentButton: PropTypes.string,
            commentContent: PropTypes.string,
            highlightButtons: PropTypes.string,
            textButton: PropTypes.string,

        }).isRequired,
        primaryid: PropTypes.number, //Primaryid of the report
        userID: PropTypes.number.isRequired, //Id of the current user
        userEmail: PropTypes.string, //Username of the current user
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
        this.commentDelete = this.commentDelete.bind(this);
        this.state = {

            searching:false, //Cehck if still searching in report (UNUSED NOW)
            valueAttr:'Search..', //Allows for Search
            addingComment: false, //True is currently adding a comment
            loading: true, //True if loading report
            editModeOn: false, //True is the edit mode is currently on
            commentsOn: false, //True if the comments section is open
            primaryId: this.props.primaryid, //Primaryid of the report
            userID: this.props.userID,  //Id of the current user
            userEmail: this.props.userEmail,  //Username of the current user
            comment: ``, //Will contain the HTML text for the comments list
            report: '', //Will contain the HTML text for the report text
            current: { //Current draft of report data
                reportText: '',
                tags: [],
            },
            saved: { //Saved draft of report data
                reportText: '',
                tags: [],
            },
            textHighlight:{ //
                searchText:'    ',
                textToHighlight:'FDA contacted the patient for follow-up after',
                activeIndex: -1,
                caseSensitive: false
            }


        };
    }

    componentWillMount() {
        if (this.props.match.params) {
            this.getTextFromID(Number(this.props.match.params.id, 10));
        } else {
            this.getTextFromID(this.props.primaryid);
        }
    }

    componentDidMount() {
        // Auto save the text every 10 seocnds
        window.addEventListener('beforeunload', this.onUnload);
        // this.autosave = setInterval(() => this.saveWork(), 10000);
    }

    onUnload = () => this.saveWork();


    /*
    Function for Deleting the user's comment. Note, this will only work for a comment within a specific report
    for the currently logged in user. All other comments will remain intact.
    */
    commentDelete = () => {

        var dummyNode = document.createElement('div'); //Create new div

        dummyNode.innerHTML = this.state.comment; //Set Div equal to list of comments HTML

        var newText = '';

        //If comments are present.
        if (dummyNode.getElementsByTagName("comments")[0]) {

            //Find comment with ID that matches the current userID
            for (var i in dummyNode.getElementsByTagName("comment")) {

                //Check that current i is valid
                if (Number.isInteger(Number(i))) {

                    //Check that comment element exists at i
                    if (dummyNode.getElementsByTagName("comment")[i]) {

                        //Check that comment id is equal to userID
                        if (dummyNode.getElementsByTagName("comment")[i].getAttribute("id").toString() === this.state.userID.toString()) {

                            //Remove comment from element list.
                            var el = dummyNode.getElementsByTagName("comment")[i];
                            el.remove();

                            newText = dummyNode.innerHTML;


                            this.setState({comment: newText, addingComment: true},  () => {
                                this.handleChange(this.state.report);

                            });

                        }
                    }
                }
            }
        }
    };


    /*
    Get the text from the Report ID when the user clicks on a report.
        id: PrimaryID of report, to be used in querry.
    */
    getTextFromID = (id) => {
        this.props.commentsOn(false);
        //Check that id is valid.
        if (isNaN(id)) {
            this.setState({
                saving: true,
                success: false,
                loading: false,
            });
        } else {
            //Get reportText from database. If report found, display it in system.
            this.props.getReportNarrativeFromID(id)
                .then((rows) => {

                    if (rows.length > 0) {
                        var reportHTML;
                        var reportText;
                        var dummyNode = document.createElement('div');
                        dummyNode.className = 'holder';
                        dummyNode.innerHTML = rows[0].report_text;

                        var commentHTML = '';

                        //If comments are in this report.
                        if (dummyNode.getElementsByTagName("comments")[0]) {

                            //If more that one comment is available.
                            if (dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment"))
                            {
                               var text = '';
                               var commentLines = '';

                                //Go through the list of comments and render them.
                                for (var i in dummyNode.getElementsByTagName("comment")) {

                                    if (Number.isInteger(Number(i))) {
                                        //If the comment has the same ID as the user, or is public, render it into the system.
                                       if (dummyNode.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                                            || dummyNode.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                                            text = text.concat(dummyNode.getElementsByTagName("comment")[i].innerText);

                                           if (dummyNode.getElementsByTagName("comment")[i].getAttribute('viewable').toString() === "public") {
                                               commentLines = commentLines.concat(`<div style='left: 3px; width: 80%; border-radius: 5px; background-color: #43e8e8; position: relative; padding: 6px ' >
                                                                                        <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")}</div>
                                                                                         </div>`);
                                           } else {

                                               var block = `<div style='left: 3px; width: 80%; border-radius: 5px; background-color: #c5cbd6; position: relative; padding: 6px ' >
                                                                 <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")} </div>
                                                                 </div>`;

                                               commentLines = commentLines.concat(block);
                                           }

                                            //document.getElementById('commentBox').value = text;

                                           document.getElementById('commentList').innerHTML = commentLines;
                                            //document.getElementById('commentBox').value = text.concat(dummyNode.getElementsByTagName("comments")[0].innerText);

                                        }

                                    }
                                    else {
                                        break;
                                    }
                                }


                            }

                            //If no comments are avialable, delete comments section from render so that comments can be added later.
                            commentHTML =  dummyNode.getElementsByTagName("comments")[0];

                            var commentFinal = commentHTML.outerHTML;


                            dummyNode.getElementsByTagName("comments")[0].remove();
                            reportHTML = dummyNode.innerHTML;

                            reportText = reportHTML + commentFinal;
                            //console.log("reportText " + reportText);

                        }
                        else {

                            //If no comments are avialable, proceed with an empty comments section.
                            commentFinal = ``;
                            reportHTML = dummyNode.innerHTML;
                            reportText = reportHTML + commentFinal;

                        }



                        //Change states when finished loading to allow for the system to display information.
                        this.setState({
                            saving: false,
                            success: true,
                            loading: false,
                            report: reportHTML,
                            comment: commentFinal,
                            current: {
                                reportText: reportText,
                                tags: rows[0].tags,
                            },
                            saved: {
                                reportText: reportText,
                                tags: rows[0].tags,
                            },
                        });
                    } else {
                        //If no text found, display nothing.
                        this.setState({
                            saving: true,
                            success: false,
                            loading: false,
                        });
                    }
                });
        }

    };

    /*
    Used for Quill Editor to change text size. (No Longer used)
        header: Chosen header format
    */
    setHeaderStyle(header) {
        this.quill.format('header', header);
    }

    /*
   Used for Quill Editor to change alignment. (No Longer used)
       align: Chosen alignment format
   */
    setAlignStyle(align) {
        this.quill.format('align', align);
    }


    /*
    Save the changes that the user has made to database.
    */
    saveWork = () => {

        //If we are not currently saving and something in the report has changed.
        if (!this.state.saving && !_.isEqual(this.state.current, this.state.saved)) {
            //Set state to indicate saving.
            this.setState({
                success: false,
                saving: true,
            });

            //Request for Backend Save.
            const fetchData = {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: this.state.current.reportText,
                    tags: this.state.current.tags,
                    primaryid: (this.props.match.params)
                        ? Number(this.props.match.params.id, 10)
                        : this.props.primaryid,

                }),

            };

            //Save to database
            fetch(`${process.env.REACT_APP_NODE_SERVER}/savereporttext`, fetchData)
                .then(() => {

                    this.props.incrementSummary();
                    this.setState({
                        saved: this.state.current,
                        success: true,
                        saving: false,
                    }, () => {
                        this.props.refreshCases();
                    });
                })
                .catch(err => console.log(err));
        }
    };



    /*
    Render the quill-editor itself. This will show us the actual report text.
    */
    display =() =>{

        var dummyNode = document.createElement('div');
        dummyNode.innerHTML = `<span style = 'font-size: 6px'> ${this.state.report} </span>`;

        return <div className={this.props.classes.quillText}>
            { (!this.state.loading)
                    ? <ReactQuill
                        id={`${this.props.primaryid}` || 'react-quill'}
                        value = {dummyNode.innerHTML}
                        onChange={this.handleChange}
                        modules={this.modules}
                        style ={{fontSize: '6px', textAlign: 'justify', border: 'none', height: (this.state.commentsOn) ?  '20%' : '31%', boxShadow: 'none'}}

                        readOnly
                    />
                    : null
            }
        </div>


    };



    /*
    This function activates whenever the user makes a change, either by hihlighting the code or commenting.
        value: Current ReportText value.
    */
    handleChange = (value) => {
        const drugRE = `background-color: ${annotationColors.drug};`;
        const reactionRE = `background-color: ${annotationColors.reaction};`;
        const dosageRE = `background-color: ${annotationColors.dosage};`;
        const ageRE = `background-color: ${annotationColors.age};`;
        const sexRE = `background-color: ${annotationColors.sex};`;
        const weightRE = `background-color: ${annotationColors.weight};`;
        const indicationRE = `background-color: ${annotationColors.indication};`;
        const interestingRE = `background-color: ${annotationColors.interesting};`;
        const newTags = {};

        const spans = document.getElementById(`${this.props.primaryid}` || 'react-quill')
            .getElementsByClassName('ql-editor')[0]
            .getElementsByTagName('span');


        //Check all highlights and change the tags as necessary.
        for (let i = 0; i < spans.length; i += 1) {

            switch (spans[i].getAttribute('style')) {
                case drugRE:
                    newTags.drug = (newTags.drug)
                        ? newTags.drug.concat(spans[i].innerText)
                        : [spans[i].innerText];
                    break;
                    case reactionRE:
                        newTags.reaction = (newTags.reaction)
                            ? newTags.reaction.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    case dosageRE:
                        newTags.dosage = (newTags.dosage)
                            ? newTags.dosage.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    case ageRE:
                        newTags.age = (newTags.age)
                            ? newTags.age.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    case sexRE:
                        newTags.sex = (newTags.sex)
                            ? newTags.sex.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    case weightRE:
                        newTags.weight = (newTags.weight)
                            ? newTags.weight.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    case indicationRE:
                        newTags.indication = (newTags.indication)
                            ? newTags.indication.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    case interestingRE:
                        newTags.interesting = (newTags.interesting)
                            ? newTags.interesting.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    default:
                }
            }

        this.setState({report: value});

        var dummyNode = document.createElement('div');
        dummyNode.innerHTML = this.state.comment;

        var comment = dummyNode.innerHTML;

        var finalText = this.state.report + comment;


        //If a new comment has been added
        if (this.state.addingComment) {
            var dummyNode2 = document.createElement('div');
            dummyNode2.innerHTML = this.state.comment;

            //If comments are already in the system
            if (dummyNode2.getElementsByTagName("comment")) {
                var text = '';
                var commentLines = '';

                //Go through all comments
                for (var i in dummyNode2.getElementsByTagName("comment")) {

                    //If there are one or more comments
                    if (dummyNode2.getElementsByTagName("comment").length > 0) {

                        //If i is a vallid number
                        if (Number.isInteger(Number(i))) {

                            //If we find a comment with the same ID as our own, or one that is public, include it into the viewable list of comments
                            if (dummyNode2.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                                || dummyNode2.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                                text = text.concat(dummyNode2.getElementsByTagName("comment")[i].innerText);

                                //If we find a comment that is public, render it here.
                                if (dummyNode2.getElementsByTagName("comment")[i].getAttribute('viewable').toString() === "public") {

                                    commentLines = commentLines.concat(`<div style='left: 3px; width: 80%; border-radius: 5px; background-color: #43e8e8; position: relative; padding: 6px ' >
                                                                        <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")} </div>
                                                                         </div>`);
                                }
                                //If we find a comment that is private, render it here.
                                else {


                                    commentLines = commentLines.concat(`<div style='left: 3px; width: 80%; border-radius: 5px; background-color: #c5cbd6; position: relative; padding: 6px ' >
                                                                        <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")} </div>
                                                                         </div>`);
                                }
                                //document.getElementById('commentBox').value = text;

                                document.getElementById('commentList').innerHTML = commentLines;

                                //document.getElementById('commentBox').value = text.concat(dummyNode.getElementsByTagName("comments")[0].innerText);
                            }

                        }
                    } else {
                        document.getElementById('commentList').innerHTML = ``;
                    }
                }

            }

            //We are done adding comments
            this.setState({ addingComment: false});

        }

        //Set the current reportText to the new report and new comments
        var finalTextComm = this.state.report + this.state.comment;

        this.setState({success: false, addingComment: false,  current: {reportText: finalTextComm, tags: newTags}});


    };



    /*
    Used for highlighting the text within the QuillEditor
        color: The background color to change the text to.

    */
    colorBackground(color) {
        const { index, length } = this.quill.getSelection();
        this.quill.formatText(index, length, 'background', color);

    };



    //This function activates when a comment is made.
    commentMade = () => {

        var comment = document.getElementById('comment').value; //Get value from comment textbox.

        var dummyNode = document.createElement('div');//Create new div

        dummyNode.innerHTML = this.state.comment;//Set new div to current list of comments.

        var newText = '';
        var checked = document.getElementById('viewToggle'); //Check if the toggle is on public or private

        //If a list of comments already exists.
        if (dummyNode.getElementsByTagName("comments")[0]) {

            //Go through a list of comments
                for (var i in dummyNode.getElementsByTagName("comment")) {


                    if (Number.isInteger(Number(i))) {

                        if (dummyNode.getElementsByTagName("comment")[i]) {

                            //If we find a comment that has the same id as the userID, edit the comment.
                            if (dummyNode.getElementsByTagName("comment")[i].getAttribute("id").toString() === this.state.userID.toString()) {


                                dummyNode.getElementsByTagName("comment")[i].innerHTML = `${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/>`;


                                if (checked.checked) {
                                    dummyNode.getElementsByTagName("comment")[i].setAttribute("viewable", 'public');
                                }
                                else {
                                    dummyNode.getElementsByTagName("comment")[i].setAttribute("viewable", 'private');
                                }

                                newText = dummyNode.innerHTML;


                                this.setState({comment: newText, addingComment: true}, function () {
                                    this.handleChange(this.state.report);

                                });

                                return
                            }
                        }
                    }
                }

            //If we do not see our new comment, add it into the list.

                var newInner;

                if (checked.checked) {

                    newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} viewable = 'public' className="comment">${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment>`);

                }
                else {

                    newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} viewable = 'private' className="comment">${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment>`);

                }




            dummyNode.getElementsByTagName("comments")[0].innerHTML = newInner;

            newText = dummyNode.innerHTML;

            this.setState({comment: newText, addingComment: true}, function () {
                this.handleChange(this.state.report);
                //document.getElementById('commentBox').value = this.state.comment.innerText;
            });



        } else {
            //If we do nt have a list of comments, add a new list.

            //Check to see if the toggle is on public or private.
            if (checked.checked) {
                //public
                var comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = 'public' class = "comment" >${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment></comments>`;

            } else {
                //private
                var comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = 'private' class = "comment" >${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment></comments>`;

            }

            this.setState({comment: comSpecial, addingComment: true}, function () {
                this.handleChange(this.state.report);
                //document.getElementById('commentBox').value = this.state.comment.innerText;
            });

            //this.handleChange(this.state.report);

        }



    };

    searchTextBox = (event) => {
        this.setState({valueAttr: event.target.value});


        if (event.target.value==='') {
            this.setState({searching:false})
        }
        else
            this.setState({searching:true});


        this.setState({textHighlight:{searchText: event.target.value},

        })


    };

    //If the comments section is open or closed, handle changing the view.
    showComments = () => {

        if (this.state.commentsOn) {
            this.setState({commentsOn: false});
            this.props.commentsOn();
            document.getElementById('MakeNote').focus()
        }
        else {
            this.setState({commentsOn: true});
            this.props.commentsOn();
            document.getElementById('MakeNote').focus()
        }
    };



    //This function operates whether or not the toolbar for the report is viewable.
    editMode = () => {

        //If edit mode is currently, on, set it to false.
        if (this.state.editModeOn) {
            //this.setContainer(`react-quill-${this.state.primaryId}-2`);

            //Hide Highlighting toolbar and show empty toolbar.
            var x = document.getElementById(`react-quill-${this.props.primaryid}`);
            x.style.display = "none";

            var y = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            y.style.display = "block";


            this.setState({editModeOn: false});
            this.saveWork();

        }
        //If edit mode is currently off, set it to true.
        else {

            //Show Highlighting toolbar and hide empty toolbar.
            var a = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            a.style.display = "none";

            var b = document.getElementById(`react-quill-${this.props.primaryid}`);
            b.style.display = "block";


            this.setState({editModeOn: true});
        }

    };


    clearText= () =>{
        this.setState({valueAttr: ''})
    };

    //Renders the toolbar for that allows the user to highlight the report text, which is used when edit mode is true.
    customToolbar = () => (

        <div id={`react-quill-${this.state.primaryId}`} className = {this.props.classes.toolbar} style={{ width: '99%', height: 'calc(8vh)', display: 'none'}}>

            {/*   These are the buttons for highlighting in the toolbar.   */}
            <Button className="ql-colorBackground" value={annotationColors.drug} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '7%',
                borderStyle: 'solid',
                paddingRight: '1px',
                paddingLeft: '1px',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                background: annotationColors.drug,
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'
            }}>
                Drug
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.reaction} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '10%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                paddingRight: '1px',
                paddingLeft: '1px',
                background: annotationColors.reaction,
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'}}>
                Reaction
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.dosage} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '10%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                paddingRight: '1px',
                paddingLeft: '1px',
                background: annotationColors.dosage,
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'
            }}>
                Dosage
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.age} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '6%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                paddingRight: '1px',
                paddingLeft: '1px',
                background: annotationColors.age,
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'
            }}>
                Age
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.sex} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '10%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                background: annotationColors.sex,
                paddingRight: '1px',
                paddingLeft: '1px',
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'
            }}>
                Gender
            </Button>
            <Button className = "ql-colorBackground" value={annotationColors.weight} style={{display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '11%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                background: annotationColors.weight,
                paddingRight: '1px',
                paddingLeft: '1px',
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'
            }}>
                Weight
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.indication} style={{display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '12.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                paddingRight: '1px',
                paddingLeft: '1px',
                background: annotationColors.indication,
                top: '5px',
                minHeight: '6%',
                fontSize: '80%'
            }}>
                Indication
            </Button>
            <Button className= "ql-colorBackground" value={annotationColors.interesting} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '12.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                paddingRight: '1px',
                paddingLeft: '1px',
                background: annotationColors.interesting,
                top: '5px',
                minHeight: '6%',
                fontSize: '80%'}}>
                Interesting
            </Button>
            <Button className="ql-colorBackground" value="" style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '7.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                paddingRight: '1px',
                paddingLeft: '1px',
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                top: '5px',
                minHeight: '6%',
                fontSize: '90%'}}>
                Clear
            </Button>

                <MaterialTooltip
                    title="In order to highlight the below text, first highlight the desired text and then, with the text still highlighted, click on the button that matches your note."
                    placement="top"
                    enterDelay={50}
                    classes={{
                        tooltip: this.props.classes.toolTipStyle,
                        popper: this.props.classes.tooltipStyle,

                    }}
                    style ={{ width: 'calc(10vh - 120px)', fontSize: '20pt',}}
                >
                    <Button style={{ padding: '0px', marginLeft: '3px', minHeight: '2px', minWidth:'2px', border: '1px solid black',
                        borderRadius: '15px',  background: annotationColors.clear, bottom: '0px'}}>
                        ? </Button>
                </MaterialTooltip>

        </div>
    );

    //Renders the empty toolbar, which is used when EditMode is false
    customToolbar2 = () => (

        <div id={`react-quill-${this.props.primaryid}-2`} style={{ padding: '6px' }} ref = 'toolbar'>

        </div>
    );

    modules = {
        toolbar: {

            container: `#react-quill-${this.props.primaryid}`,
            handlers: {
                colorBackground: this.colorBackground,
                //commentMade: this.commentMade,
                header: this.setHeaderStyle,

                editModeIsOn: this.editMode,

                align: this.setAlignStyle,

            },
        },
        history: {
            delay: 500,
            maxStack: 500,
            userOnly: true,
        },
    };


    //Render QuillEditor.jsx
    render() {

        const { ...props } = this.props;
        const { activeIndex, caseSensitive, searchText } = this.state.textHighlight;
        const  textToHighlight = this.state.current.reportText;


        const searchWords= searchText.split(/\s/).filter(word => word)

        return (
            <div className={this.props.classes.pdfView} style = {{ height: (this.props.summaryOn) ? 'calc(85vh - 122px)' : 'calc(93vh - 122px)'}} >

                <div className = {this.props.classes.quillArea} style = {{ display: 'inline-block', height: (this.state.commentsOn) ? '60%': '90%', overflow: 'scroll' }}>
                    <div className={this.props.classes.editFacet}>
                        <div className={this.props.classes.editBox} style={{width:'auto'}}>
                            <div onClick={this.editMode}><Typography align='right' variant='button' className={this.props.classes.textButton}>{(this.state.editModeOn) ? 'Stop Editing' : 'Edit Highlights'}</Typography></div>
                        </div>
                        <div className={(this.state.editModeOn) ? this.props.classes.saveBox : this.props.classes.noBox}
                             onClick={this.saveWork}><Typography align='center' id ='saveButton' type='button' style={{color:(this.state.saving) ? '#1D1F83' : '#000', backgroundColor: (this.state.success)  ?  '#D3D3D3' : '#dbf0ff'}}>Save Highlights</Typography></div>
                    </div>

                {/* ====== Quill editor for Annotating the Report Text ====== */}

                {this.customToolbar()}
                {this.customToolbar2()}

                    {(!this.state.searching)
                        ? this.display()
                        : (

                            <Highlighter
                                activeClassName={styles.Active}
                                activeIndex={this.state.textHighlight.activeIndex}
                                caseSensitive={this.state.textHighlightcaseSensitive}
                                highlightClassName={styles.Highlight}
                                highlightStyle={{ fontWeight: 'normal', backgroundColor : '#ffd54f' }}
                                searchWords={searchWords}
                                textToHighlight={textToHighlight}
                            />
                        )
                    }
            </div>
                <div id="commentArea" className={this.props.classes.commentSec} >
                    <div className={this.props.classes.commentBtn} onClick={() => this.showComments()}>
                        <Typography variant='button' className={this.props.classes.textButton}>{(this.state.commentsOn) ? 'Hide' : 'Show'} Comments</Typography>
                    </div>
                    <Collapse isOpened={this.state.commentsOn} style = {{position: 'relative', width: '100%'}}>
                        <div className='commentContent' style = {{width: '100%'}}>
                            <div id="commentsView">
                                <h4 style = {{left: '3px'}}>Comments</h4>
                                <div id="commentList">

                                </div>
                            </div>
                            <div style={{padding: '4px'}}>
                                <textarea id="comment" style = {{resize: 'none', width: '80%'}} rows="4"/>
                            </div>

                            <div style={{padding: '4px', display: 'inline-block', width: '80%'}}>

                                <span style = {{position: 'relative', left: '5px', bottom: '4px', marginRight: '2px'}}>Public:</span>
                                <label className = "switch">

                                    <input id = 'viewToggle' type ="checkbox" name="viewable" />
                                    <span className ="slider"/>

                                </label>

                                <MaterialTooltip
                                    title="Post Comment to Report"
                                    placement="top"
                                    enterDelay={50}
                                    classes={{
                                        tooltip: this.props.classes.toolTipStyle,
                                        popper: this.props.classes.tooltipStyle,
                                    }}
                                    style={{fontSize: '20pt', position: 'relative'}}
                                >
                                <Button id="MakeNote" style={{padding: '0', position: 'relative', border: '2px solid #1d00ff',  height: 'calc(4vh)', left: '6.25%',  width: '11%'}}
                                        onClick={() => this.commentMade()}> Post </Button>
                                </MaterialTooltip>
                                <MaterialTooltip
                                    title="Save Comment to Database"
                                    placement="top"
                                    enterDelay={50}
                                    classes={{
                                        tooltip: this.props.classes.toolTipStyle,
                                        popper: this.props.classes.tooltipStyle,
                                    }}
                                    style={{fontSize: '20pt', position: 'relative'}}
                                >
                                <Button
                                    id="saveButton2"
                                    variant ="raised"
                                    color="primary"
                                    className={(this.state.success) ? this.props.classes.buttonSuccess : ''}
                                    disabled={this.state.saving}
                                    onClick={this.saveWork}
                                    style={{ left: '7%', minWidth: '5%',  height: 'calc(4vh)', minHeight: 'calc(4vh)'}}>

                                    Save
                                </Button>
                                </MaterialTooltip>
                                <MaterialTooltip
                                    title="Delete Your Comment"
                                    placement="top"
                                    enterDelay={50}
                                    classes={{
                                        tooltip: this.props.classes.toolTipStyle,
                                        popper: this.props.classes.tooltipStyle,
                                    }}
                                    style={{fontSize: '20pt', position: 'relative'}}
                                >
                                    <Button id="delete" style={{
                                        border: '2px solid red',
                                        width: '12%',
                                        left: '50%',
                                        height: 'calc(4vh)',
                                        padding: '0',
                                    }} onClick={() => this.commentDelete()}>
                                        Delete X
                                    </Button>
                                </MaterialTooltip>

                            </div>
                        </div>
                    </Collapse>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => ({
    userID: state.user.userID,
});

export default withStyles(styles)(connect(
    mapStateToProps,
    { getReportNarrativeFromID,
        htmlEncode,
        htmlUnescape,},
)(QuillEditor));



