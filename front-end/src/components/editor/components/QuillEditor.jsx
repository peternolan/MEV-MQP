import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes, {string} from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Paper from 'material-ui/Paper';
import _ from 'lodash';
import Button from 'material-ui/Button';
import { getReportNarrativeFromID, htmlEncode, htmlUnescape} from '../../../actions/reportActions';
import styles from './QuillEditorStyles';
import annotationColors from './AnnotationColors';
import Highlighter from 'react-highlight-words';
import MaterialTooltip from 'material-ui/Tooltip';
import Divider from 'material-ui/Divider';
import Typography from 'material-ui/Typography';
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
            commentButton: PropTypes.string,
            commentContent: PropTypes.string,
            highlightButtons: PropTypes.string,
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

    static defaultProps = {
        match: {},
        primaryid: null,
        incrementSummary: () => {},
    };

    constructor(props){

        super(props);
        this.commentDelete = this.commentDelete.bind(this);
        this.state = {
            //commentDelete: this.commentDelete,
            searching:false,
            valueAttr:'Search..',
            addingComment: false,
            loading: true,
            editModeOn: false,
            commentsOn: false,
            primaryId: this.props.primaryid,
            userID: this.props.userID,
            userEmail: this.props.userEmail,
            comment: ``,
            report: '',
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

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onUnload);
        // clearInterval(this.autosave);
    }

    onUnload = () => this.saveWork();


    commentDelete = () => {


        var dummyNode = document.createElement('div');

        dummyNode.innerHTML = this.state.comment;

        console.log("comment Delete " + dummyNode.innerHTML);

        var newText = '';

        if (dummyNode.getElementsByTagName("comments")[0]) {

            for (var i in dummyNode.getElementsByTagName("comment")) {


                if (Number.isInteger(Number(i))) {

                    if (dummyNode.getElementsByTagName("comment")[i]) {


                        if (dummyNode.getElementsByTagName("comment")[i].getAttribute("id").toString() === this.state.userID.toString()) {

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


    getTextFromID = (id) => {

        if (isNaN(id)) {
            this.setState({
                saving: true,
                success: false,
                loading: false,
            });
        } else {
            console.log(this.props.getReportNarrativeFromID(id));
            this.props.getReportNarrativeFromID(id)
                .then((rows) => {

                    if (rows.length > 0) {
                        var reportHTML;
                        var reportText;
                        var dummyNode = document.createElement('div');
                        dummyNode.className = 'holder';
                        dummyNode.innerHTML = rows[0].report_text;

                        var commentHTML = '';


                        if (dummyNode.getElementsByTagName("comments")[0]) {


                            if (dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment"))
                            {
                               var text = '';
                               var commentLines = '';

                                for (var i in dummyNode.getElementsByTagName("comment")) {

                                    if (Number.isInteger(Number(i))) {
                                       if (dummyNode.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                                            || dummyNode.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                                            text = text.concat(dummyNode.getElementsByTagName("comment")[i].innerText);

                                           if (dummyNode.getElementsByTagName("comment")[i].getAttribute('viewable').toString() === "public") {
                                               commentLines = commentLines.concat(`<div style='left: 3px; width: 70%; border-radius: 25px; background-color: #43e8e8; position: relative; padding: 6px ' >
                                                                                        <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")}</div>
                                                                                         </div>`);
                                           } else {

                                               var block = `<div style='left: 3px; width: 70%; border-radius: 25px; background-color: #c5cbd6; position: relative; padding: 6px ' >
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

                            commentHTML =  dummyNode.getElementsByTagName("comments")[0];

                            var commentFinal = commentHTML.outerHTML;


                            dummyNode.getElementsByTagName("comments")[0].remove();
                            reportHTML = dummyNode.innerHTML;

                            reportText = reportHTML + commentFinal;
                            //console.log("reportText " + reportText);

                        }
                        else {
                            commentFinal = ``;
                            reportHTML = dummyNode.innerHTML;
                            reportText = reportHTML + commentFinal;

                        }



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
                        this.setState({
                            saving: true,
                            success: false,
                            loading: false,
                        });
                    }
                });
        }

    };

    setHeaderStyle(header) {
        this.quill.format('header', header);
    }

    setAlignStyle(align) {
        this.quill.format('align', align);
    }


    saveWork = () => {
        if (!this.state.saving && !_.isEqual(this.state.current, this.state.saved)) {
            document.getElementById('saveButton').style.backgroundColor = '#D3D3D3';
            this.setState({
                success: false,
                saving: true,
            });

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

            fetch(`${process.env.REACT_APP_NODE_SERVER}/savereporttext`, fetchData)
                .then(() => {
                    this.props.incrementSummary();
                    document.getElementById('saveButton').style.backgroundColor = "#D3D3D3";
                    this.setState({
                        saved: this.state.current,
                        success: true,
                        saving: false,
                    });
                })
                .catch(err => console.log(err));
        }
    };



    display =() =>{


        var dummyNode = document.createElement('div');
        dummyNode.innerHTML = `<span style = 'font-size: 6px'> ${this.state.report} </span>`;

        console.log(this.state.report);
        console.log(dummyNode.outerHTML);
        console.log(dummyNode.outerHTML);


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



    //Need to Set State in order to make sure it doesn't change when we add comments.
    handleChange = (value) => {
        console.log("HandleChange");

        document.getElementById('saveButton').style.backgroundColor = '#dbf0ff';

        console.log("addingComment " + this.state.addingComment);

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

        this.setState({success: false, current: {reportText: finalText, tags: newTags}});

        if (this.state.addingComment) {
            var dummyNode2 = document.createElement('div');
            dummyNode2.innerHTML = this.state.comment;

            if (dummyNode2.getElementsByTagName("comment")) {
                var text = '';
                var commentLines = '';

                for (var i in dummyNode2.getElementsByTagName("comment")) {

                    if (dummyNode2.getElementsByTagName("comment").length > 0) {


                        if (Number.isInteger(Number(i))) {
                            if (dummyNode2.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                                || dummyNode2.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                                text = text.concat(dummyNode2.getElementsByTagName("comment")[i].innerText);

                                if (dummyNode2.getElementsByTagName("comment")[i].getAttribute('viewable').toString() === "public") {

                                    commentLines = commentLines.concat(`<div style='left: 3px; width: 70%; border-radius: 25px; background-color: #43e8e8; position: relative; padding: 6px ' >
                                                                        <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")} </div>
                                                                         </div>`);
                                } else {


                                    commentLines = commentLines.concat(`<div style='left: 3px; width: 70%; border-radius: 25px; background-color: #c5cbd6; position: relative; padding: 6px ' >
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
                console.log("Comments after " + document.getElementById('commentList').innerHTML);
            }


            this.setState({ addingComment: false});

        }

        var finalTextComm = this.state.report + this.state.comment;

        this.setState({success: false, addingComment: false,  current: {reportText: finalTextComm}});


    };





    colorBackground(color) {

        const { index, length } = this.quill.getSelection();
        this.quill.formatText(index, length, 'background', color);

    };




    commentMade = () => {

        var comment = document.getElementById('comment').value;

        var dummyNode = document.createElement('div');

        dummyNode.innerHTML = this.state.comment;

        var newText = '';
        var radios = document.getElementsByName("viewable");

        if (dummyNode.getElementsByTagName("comments")[0]) {


                for (var i in dummyNode.getElementsByTagName("comment")) {


                    if (Number.isInteger(Number(i))) {

                        if (dummyNode.getElementsByTagName("comment")[i]) {


                            if (dummyNode.getElementsByTagName("comment")[i].getAttribute("id").toString() === this.state.userID.toString()) {


                                dummyNode.getElementsByTagName("comment")[i].innerHTML = `${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/>`;

                                for (var j in radios) {
                                    if (radios[j].checked) {
                                        dummyNode.getElementsByTagName("comment")[i].setAttribute("viewable", radios[j].value);
                                    }

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


                var newInner;

                for (var k in radios) {
                    if (radios[k].checked) {
                        newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} 
viewable = ${radios[k].value} className="comment">${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment>`);
                    }

                }



            dummyNode.getElementsByTagName("comments")[0].innerHTML = newInner;

            newText = dummyNode.innerHTML;

            this.setState({comment: newText, addingComment: true}, function () {
                this.handleChange(this.state.report);
                //document.getElementById('commentBox').value = this.state.comment.innerText;
            });



        } else {

            for (var x in radios) {
                if (radios[x].checked) {
                    console.log("comment " + comment.replace(/\n/g, " n$"));
                    var comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = ${radios[x].value} class = "comment" >${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment></comments>`;

                }

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


    showComments = () => {

        if (this.state.commentsOn) {
            this.setState({commentsOn: false});
            document.getElementById('MakeNote').focus()
        }
        else {
            this.setState({commentsOn: true});
            document.getElementById('MakeNote').focus()
        }
    };



    editMode = () => {

        if (this.state.editModeOn) {
            //this.setContainer(`react-quill-${this.state.primaryId}-2`);

            var x = document.getElementById(`react-quill-${this.props.primaryid}`);
            x.style.display = "none";

            /*
            var yyy = document.getElementById(`saveButton1`);
            yyy.style.display = "none";

            var yx = document.getElementById(`saveButton1b`);
            yx.style.display = "none";
            */
            var y = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            y.style.display = "block";


            this.setState({editModeOn: false});
            this.saveWork();

            //this.render();
        }
        else {

            //this.setContainer(`react-quill-${this.state.primaryId}`);
            var a = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            a.style.display = "none";

            /*
            var cc = document.getElementById(`saveButton1`);
            cc.style.display = "inline-block";

            var ca = document.getElementById(`saveButton1b`);
            ca.style.display = "inline-block";

            */
            var b = document.getElementById(`react-quill-${this.props.primaryid}`);
            b.style.display = "block";


            this.setState({editModeOn: true});
            //this.render();
        }

    };


    clearText= () =>{
        this.setState({valueAttr: ''})
    };

    customToolbar = () => (

        <div id={`react-quill-${this.state.primaryId}`} style={{ height: 'calc(7vh)', display: 'none'}}>

            {/*
            <select defaultValue="false" className="ql-header" style={{ width: '100px', height: '36px', margin: '4px' }}>
                <option value="1"/>
                <option value="2"/>
                <option value="false"/>

            </select>

            <select defaultValue="justify" className="ql-align" style={{ width: '30px', height: '20px', margin: '4px' }}>
                <option value="center" />
                <option value="right" />
                <option value="justify" />
            </select>
            */}
            <Button className="ql-colorBackground" value={annotationColors.drug} style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '9%',
                borderStyle: 'solid',
                padding: '0px',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                background: annotationColors.drug,
                top: '5px',
                minHeight: '6px'
            }}>
                Drug
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.reaction} style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '12%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                padding: '0px',
                background: annotationColors.reaction,
                top: '5px',
                minHeight: '6px'}}>
                Reaction
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.dosage} style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '11.15%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                padding: '0px',
                background: annotationColors.dosage,
                top: '5px',
                minHeight: '6px'}}>
                Dosage
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.age} style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '9%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                padding: '0px',
                background: annotationColors.age,
                top: '5px',
                minHeight: '6px'}}>
                Age
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.sex} style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '11.15%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                padding: '0px',
                background: annotationColors.sex,
                top: '5px',
                minHeight: '6px'}}>
                Gender
            </Button>
            <Button className = "ql-colorBackground" value={annotationColors.weight} style={{display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '11.15%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                background: annotationColors.weight,
                top: '5px',
                minHeight: '6px'}}>
                Weight
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.indication} style={{display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '12.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                padding: '0px',
                background: annotationColors.indication,
                top: '5px',
                minHeight: '6px'}}>
                Indication
            </Button>
            <Button className= "ql-colorBackground" value={annotationColors.interesting} style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '12.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                padding: '0px',
                background: annotationColors.interesting,
                top: '5px',
                minHeight: '6px'}}>
                Interesting
            </Button>
            <Button className="ql-colorBackground" value="" style={{ display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '7.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                padding: '0px',
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                top: '5px',
                minHeight: '6px'}}>
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
                    style ={{ fontSize: '20pt',}}
                >
                    <Button style={{ padding: '0px', marginLeft: '5px', minHeight: '2px', minWidth:'2px', border: '1px solid black',
                        borderRadius: '15px',  background: annotationColors.clear, bottom: '0px'}}>
                        ? </Button>
                </MaterialTooltip>

            {/*<div class = 'tooltip' >Tooltip <span class = 'tooltiptext'></span></div>*/}


            {/*
            <div style={{position: 'absolute', bottom: 0, right: 0,}}>
                <input className="ql-colorBackground pull-right" id="SearchTextbox" value= "Search.." ref={el => this.inputEntry = el} type="text" name="search" value = {this.state.valueAttr}  onClick= {this.clearText} onChange={this.searchTextBox}  style={{verticalAlign: 'absolute', padding: '0px', margin: '0px' }} />
            </div>
                */}
        </div>
    );


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


    render() {

        const { ...props } = this.props;
        const { activeIndex, caseSensitive, searchText } = this.state.textHighlight;
        const  textToHighlight = this.state.current.reportText;


        const searchWords= searchText.split(/\s/).filter(word => word)

        return (
            <div className={this.props.classes.pdfView}>
                <div className = {this.props.classes.quillArea}>
                    {/*
                        <Paper className={this.props.classes.legend}>

                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'chartreuse'}}><Typography type='button'>Drug</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'cadetblue'}}><Typography type='button'>Reaction</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'darkorange'}}><Typography type='button'>Dosage</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'gold'}}><Typography type='button'>Age</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'lightpink'}}><Typography type='button'>Sex</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'orchid'}}><Typography type='button'>Weight</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'silver'}}><Typography type='button'>Indication</Typography></Paper>
                            <Paper className={this.props.classes.legendEntry} style={{backgroundColor: 'cyan'}}><Typography type='button'>Interesting</Typography></Paper>
                        </Paper>
                        */}
                        <Paper>
                            <div onClick={this.editMode} className={this.props.classes.editBtn}><Typography type='button'>{(this.state.editModeOn) ? 'Stop Editing' : 'Edit Highlights'}</Typography></div>
                            <Paper key='editSpecificButtons'>
                                <Collapse isOpened={this.state.editModeOn}>
                                    <Paper className={this.props.classes.editButton} onClick={this.saveWork}>
                                        <Typography id = 'saveButton' type='button'>Save Highlights</Typography>
                                    </Paper>
                                </Collapse>
                            </Paper>
                        </Paper>
                    <div className={this.props.classes.editFacet}>
                        
                    </div>

                {/* ====== Quill editor for Annotating the Report Text ====== */}

                {/* <!--<Paper elevation={4} className={this.props.classes.paperWindow}>--> */}

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
                        <Typography type='button' className={this.props.classes.textButton}>{(this.state.commentsOn) ? 'Hide' : 'Show'} Comments</Typography>
                    </div>
                    <Collapse isOpened={this.state.commentsOn} style = {{position: 'relative', width: '65%'}}>
                        <div className='commentContent' style = {{width: '100%'}}>
                            <div id="commentsView">
                                <h3 style = {{left: '3px'}}>Comments</h3>
                                <div id="commentList">

                                </div>
                            </div>
                            <div style={{padding: '4px'}}>
                                <textarea id="comment" style = {{width: '70%'}} rows="4">  </textarea>
                            </div>

                            <div style={{padding: '4px', display: 'inline-block', width: '70%'}}>
                                <form id="radio-form" style={{display: 'inline-block'}}>
                                    <input type="radio" name="viewable" value="private" checked="yes" style={{padding: '5px'}} defaultChecked/>Private
                                    <input type="radio" name="viewable" value="public" style={{padding: '5px'}}/>Public
                                </form>

                                <Button id="MakeNote" style={{border: '2px solid #1d00ff', left: '30px'}}
                                        onClick={() => this.commentMade()}> Make Note </Button>
                                <Button
                                    id="saveButton2"
                                    raised
                                    color="primary"
                                    className={(this.state.success) ? this.props.classes.buttonSuccess : ''}
                                    disabled={this.state.saving}
                                    onClick={this.saveWork}
                                    style={{ left: '40px'}}>

                                    Save
                                </Button>
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
                                        left: '60%',
                                        border: '2px solid #ff0000'
                                    }} onClick={() => this.commentDelete()}>
                                        <img src={DeleteIcon} style={{width: '15px', height: '20px'}}/>
                                    </button>
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

export default connect(
    mapStateToProps,
    { getReportNarrativeFromID,
        htmlEncode,
        htmlUnescape,},
)(withStyles(styles)(QuillEditor));



