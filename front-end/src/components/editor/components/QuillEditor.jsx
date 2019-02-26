import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import { getReportNarrativeFromID, htmlEncode, htmlUnescape} from '../../../actions/reportActions';
import styles from './QuillEditorStyles';
import annotationColors from './AnnotationColors';
import Highlighter from 'react-highlight-words';
import MaterialTooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import './NarrativeAnnotator.css';
import {Collapse} from 'react-collapse';

class QuillEditor extends Component {

    static propTypes = {
        getReportNarrativeFromID: PropTypes.func.isRequired,
        htmlEncode: PropTypes.func.isRequired,
        htmlUnescape: PropTypes.func.isRequired,
        incrementSummary: PropTypes.func,
        commentsOn: PropTypes.func,
        classes: PropTypes.shape({
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
        this.props.commentsOn(false);
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
        console.log('SaveWork');
        if (!this.state.saving && !_.isEqual(this.state.current, this.state.saved)) {
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

                                    commentLines = commentLines.concat(`<div style='left: 3px; width: 80%; border-radius: 5px; background-color: #43e8e8; position: relative; padding: 6px ' >
                                                                        <div style ='left: 20px'>${dummyNode.getElementsByTagName("comment")[i].innerText.replace("n$", "</br>")} </div>
                                                                         </div>`);
                                } else {


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
        var checked = document.getElementById('viewToggle');

        console.log('checked ' + checked.checked);

        if (dummyNode.getElementsByTagName("comments")[0]) {


                for (var i in dummyNode.getElementsByTagName("comment")) {


                    if (Number.isInteger(Number(i))) {

                        if (dummyNode.getElementsByTagName("comment")[i]) {


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


                var newInner;


                if (checked.checked) {
                    console.log("Checked True")
                    newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} viewable = 'public' className="comment">${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment>`);

                }
                else {
                    console.log("Checked False")
                    newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} viewable = 'private' className="comment">${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment>`);

                }




            dummyNode.getElementsByTagName("comments")[0].innerHTML = newInner;

            newText = dummyNode.innerHTML;

            this.setState({comment: newText, addingComment: true}, function () {
                this.handleChange(this.state.report);
                //document.getElementById('commentBox').value = this.state.comment.innerText;
            });



        } else {

            var comSpecial;
            if (checked.checked) {
                console.log("Checked True")
                comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = 'public' class = "comment" >${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment></comments>`;

            } else {
                console.log("Checked False")
                comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = 'private' class = "comment" >${this.state.userEmail}: ${comment.replace(/\n/g, " n$")}\n<br/></comment></comments>`;

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
            this.props.commentsOn();
            document.getElementById('MakeNote').focus()
        }
        else {
            this.setState({commentsOn: true});
            this.props.commentsOn();
            document.getElementById('MakeNote').focus()
        }
    };



    editMode = () => {

        if (this.state.editModeOn) {
            //this.setContainer(`react-quill-${this.state.primaryId}-2`);

            var x = document.getElementById(`react-quill-${this.props.primaryid}`);
            x.style.display = "none";

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

        <div id={`react-quill-${this.state.primaryId}`} className = {this.props.classes.toolbar} style={{ width: '99%', height: 'calc(8vh)', display: 'none'}}>

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
            <Button className="ql-colorBackground" value={annotationColors.drug} style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '7%',
                borderStyle: 'solid',
                padding: '0px',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                background: annotationColors.drug,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'
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
                padding: '0px',
                background: annotationColors.reaction,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'}}>
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
                padding: '0px',
                background: annotationColors.dosage,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'
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
                padding: '0px',
                background: annotationColors.age,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'
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
                padding: '0px',
                background: annotationColors.sex,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'
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
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'
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
                padding: '0px',
                background: annotationColors.indication,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'
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
                padding: '0px',
                background: annotationColors.interesting,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'}}>
                Interesting
            </Button>
            <Button className="ql-colorBackground" value="" style={{ display: 'inline-block',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '7.5%',
                borderStyle: 'solid',
                borderWidth: 1,
                padding: '0px',
                borderColor: 'rgba(0, 0, 0, .25)',
                borderRadius: 0,
                top: '5px',
                minHeight: '6%',
                fontSize: '10px'}}>
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
        const { searchText } = this.state.textHighlight;
        const  textToHighlight = this.state.current.reportText;


        const searchWords= searchText.split(/\s/).filter(word => word)

        return (
            <div className={this.props.classes.pdfView} >
                <div className = {this.props.classes.quillArea} style = {{ display: 'inline-block', height: (this.state.commentsOn) ? '50%': '90%', overflow: 'scroll' }}>
                    <div className={this.props.classes.editFacet}>
                        <div className={this.props.classes.editBox} style={{width:'auto'}}>
                            <div onClick={this.editMode}><Typography align='right' variant='button'>{(this.state.editModeOn) ? 'Stop Editing' : 'Edit Highlights'}</Typography></div>
                        </div>
                        <div className={(this.state.editModeOn) ? this.props.classes.saveBox : this.props.classes.noBox}
                             onClick={this.saveWork}><Typography align='center' id ='saveButton' type='button' style={{color:(this.state.saving) ? '#1D1F83' : '#000', backgroundColor: (this.state.success)  ?  '#D3D3D3' : '#dbf0ff'}}>Save Highlights</Typography></div>
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

                                <Button id="MakeNote" style={{padding: '0', position: 'relative', border: '2px solid #1d00ff', left: '6.25%',  width: '11%'}}
                                        onClick={() => this.commentMade()}> Make Note </Button>
                                <Button
                                    id="saveButton2"
                                    raised="true"
                                    color="primary"
                                    className={(this.state.success) ? this.props.classes.buttonSuccess : ''}
                                    disabled={this.state.saving}
                                    onClick={this.saveWork}
                                    style={{ left: '7%', minWidth: '5%', minHeight: 'calc(1.25vw)'}}>

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
                                    style={{fontSize: '20pt', position: 'relative'}}
                                >
                                    <Button id="delete" style={{
                                        border: '2px solid red',
                                        width: '11%',
                                        height: 'calc(1.25vw)',
                                        left: '50%',
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



