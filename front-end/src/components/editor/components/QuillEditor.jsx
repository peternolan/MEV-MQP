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
import { getReportNarrativeFromID, htmlEncode, htmlUnescape, getComment } from '../../../actions/reportActions';
import styles from './QuillEditorStyles';
import annotationColors from './AnnotationColors';
import Highlighter from 'react-highlight-words';
// import styles from 'react-highlight-words.example.css'
// import latinize from 'latinize';
import './NarrativeAnnotator.css';
//const ToolTip = Quill.import('ui/tooltip');

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
        }).isRequired,
        primaryid: PropTypes.number,
        userID: PropTypes.number.isRequired,
        match: PropTypes.shape({
            params: PropTypes.shape({
                id: PropTypes.string,
            }),
        }),
    }

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
                        var reportHTML;
                        var reportText;
                        var dummyNode = document.createElement('div');
                        dummyNode.className = 'holder';
                        dummyNode.innerHTML = rows[0].report_text;

                        console.log('innerHTML At Beginning ' + dummyNode.innerHTML);

                        var commentHTML = '';
                        console.log( "commentHTML " + commentHTML);
                        if (dummyNode.getElementsByTagName("comments")[0]) {
                            console.log("holder " + dummyNode.getElementsByTagName("comments")[0].outerHTML);
                            console.log("holder first comment " + dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment")[0].outerHTML);
                            console.log("innerText holder " + dummyNode.getElementsByTagName("comments")[0].innerText.toString());


                            if (dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment"))
                            {
                                console.log("Found Comment " + dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment")[0]);
                                var text = '';
                                console.log("viewable " + dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment")[0].getAttribute("viewable").toString());

                                for (var i in dummyNode.getElementsByTagName("comment")) {
                                    console.log("i " + i);

                                    //console.log("Found Comment in for loop id " +  dummyNode.getElementsByTagName("comment")[i].id.toString());

                                    /*
                                    if (dummyNode.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()) {
                                        console.log("IDs are equal");
                                    }
                                    else {
                                        console.log("IDs are NOT equal");
                                    }
                                    */

                                    if (Number.isInteger(Number(i))) {
                                        console.log("viewable " + dummyNode.getElementsByTagName("comment")[i].getAttribute("viewable").toString());
                                        if (dummyNode.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                                            || dummyNode.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                                            text = text.concat(dummyNode.getElementsByTagName("comment")[i].innerText);

                                            console.log("Text Load " + text);

                                            document.getElementById('commentBox').value = text;

                                            //document.getElementById('commentBox').value = text.concat(dummyNode.getElementsByTagName("comments")[0].innerText);

                                        }

                                    }
                                    else {
                                        break;
                                    }
                                }


                            }

                            commentHTML =  dummyNode.getElementsByTagName("comments")[0];
                            console.log( "commentHTML " + commentHTML);

                            var commentFinal = commentHTML.outerHTML;

                            console.log("Commentfinal " + commentFinal);
                            console.log("Commentfinal " + commentFinal.innerText);

                            dummyNode.getElementsByTagName("comments")[0].remove();
                            console.log("reportText " + dummyNode.innerHTML);
                            reportHTML = dummyNode.innerHTML;

                            reportText = reportHTML + commentFinal;

                            console.log("Report Text beginning Final " + reportText);
                        }
                        else {
                            commentFinal = ``;
                            reportHTML = dummyNode.innerHTML;
                            reportText = reportHTML + commentFinal;

                            console.log("Report Text beginning Final NO COMMENT " + reportText);
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


    saveWork = () => {
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

        return <div>
            {/* {this.customToolbar()} */}
            {console.log("ReactQuill " + this.props.primaryid)}
            {console.log("Report text Display" + this.state.report)}

            {

                (!this.state.loading)
                    ? <ReactQuill
                        id={`${this.props.primaryid}` || 'react-quill'}
                        value = {this.state.report}
                        onChange={this.handleChange}
                        modules={this.modules}
                        theme="snow"
                        readOnly
                    />
                    : null
            }

        </div>


    };



    //Need to Set State in order to make sure it doesn't change when we add comments.
    handleChange = (value) => {

        console.log("Handle Change " + value);
        console.log("Handle Change Report Text " + this.state.current.reportText);
        console.log("this.state.addingComment " + this.state.addingComment);

        if (!this.state.addingComment) {
            const drugRE = `background-color: ${annotationColors.drug};`;
            const reactionRE = `background-color: ${annotationColors.reaction};`;
            const dosageRE = `background-color: ${annotationColors.dosage};`;
            const ageRE = `background-color: ${annotationColors.age};`;
            const sexRE = `background-color: ${annotationColors.sex};`;
            const weightRE = `background-color: ${annotationColors.weight};`;
            const indicationRE = `background-color: ${annotationColors.indication};`;
            const interestingRE = `background-color: ${annotationColors.interesting};`;
            const newTags = {};

            console.log('This ' + `${this.props.primaryid}`);
            const spans = document.getElementById(`${this.props.primaryid}` || 'react-quill')
                .getElementsByClassName('ql-editor')[0]
                .getElementsByTagName('span');


            for (let i = 0; i < spans.length; i += 1) {
                console.log('spans ' + spans[i].getAttribute('style'));
                console.log('span ' + i + ' ' + spans[i]);
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
                        console.log('innerText ' + spans[i].innerText);
                        newTags.interesting = (newTags.interesting)
                            ? newTags.interesting.concat(spans[i].innerText)
                            : [spans[i].innerText];
                        break;
                    default:
                }
            }

            console.log('value ' + value);


            this.setState({report: value});
            console.log("Comment in alternate change " + this.state.comment);

            var dummyNode = document.createElement('div');
            dummyNode.innerHTML = this.state.comment;
            console.log("comment in alternate change dummy Node " + dummyNode.innerHTML);
            console.log("dummynode InnerText " + dummyNode.innerText);

            var comment = dummyNode.innerHTML;


            var finalText = this.state.report + comment;

            console.log('STATE WILL CHANGE TO : ' + finalText);


            this.setState({success: false, current: {reportText: finalText, tags: newTags}});
            //this.setState({success: false, current: {reportText: value, tags: newTags}});
            console.log('Report Text After set state Handle Change' + this.state.current.reportText);
        }
        else {

            //console.log("this.state.comment.innerText " + this.state.comment);
            console.log("this.state.comment " + this.state.comment);

            var dummyNode = document.createElement('div');
            dummyNode.innerHTML = this.state.comment;
            console.log("commentMade Begin state comment " + dummyNode.innerHTML);
            console.log("Comment InnerText " + dummyNode.innerText);

            if (dummyNode.getElementsByTagName("comment")) {
                var text = '';

                for (var i in dummyNode.getElementsByTagName("comment")) {
                    console.log("i " + i);

                    //console.log("Found Comment id " + dummyNode.getElementsByTagName("comment")[i].id.toString());
                    //console.log("Current id" + this.state.userID.toString());

                    if (Number.isInteger(Number(i))) {
                        if (dummyNode.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()) {

                            console.log("Found Comment in for loop id " + dummyNode.getElementsByTagName("comment")[i].id.toString());

                            text = text.concat(dummyNode.getElementsByTagName("comment")[i].innerText);

                            console.log("Text Load " + text);

                            document.getElementById('commentBox').value = text;

                            //document.getElementById('commentBox').value = text.concat(dummyNode.getElementsByTagName("comments")[0].innerText);
                        }

                    } //else {
                      //  break;
                    //}
                }
            }
            else {

                console.log("commentMade Begin State comment " + dummyNode.innerHTML);
                console.log("comment innerText " + dummyNode.innerText);

                document.getElementById('commentBox').value = dummyNode.innerText;

            }

            //document.getElementById('commentBox').value = dummyNode.innerText;

            var finalTextComm = this.state.report + this.state.comment;


            console.log('STATE WILL CHANGE TO : ' + finalTextComm);

            this.setState({success: false, addingComment: false,  current: {reportText: finalTextComm}});

        }
    };





    colorBackground(color) {
        console.log('color background ' + color);
        const { index, length } = this.quill.getSelection();
        this.quill.formatText(index, length, 'background', color);

    };




    commentMade = () => {

        var comment = document.getElementById('comment').value;

        console.log("Comment Text " + comment);

        var dummyNode = document.createElement('div');
        console.log("commentMade Begin state comment " + this.state.comment);
        dummyNode.innerHTML = this.state.comment;

        console.log("dummyNode.innerHTML commentMade " + dummyNode.innerHTML);

        var newText = '';
        var radios = document.getElementsByName("viewable");

        if (dummyNode.getElementsByTagName("comments")[0]) {
            console.log("Comments are in here already.");
            console.log("Comments in desc " + dummyNode.getElementsByTagName("comment")[0].outerHTML);
            for (var i in dummyNode.getElementsByTagName("comment")) {

                console.log("Comment Found" + dummyNode.getElementsByTagName("comment")[i].innerHTML);
                if (dummyNode.getElementsByTagName("comment")[i]) {
                    console.log("Does exist");
                } else {
                    console.log("Does NOT exist");
                }
                console.log("i " + i);
                console.log("Is Number " + Number.isInteger(Number(i)));

                if (Number.isInteger(Number(i))) {
                    console.log("IS A NUMBER");
                    if (dummyNode.getElementsByTagName("comment")[i]) {
                        console.log("COMMENT EXISTS");
                        console.log("Get Attribute Again " + dummyNode.getElementsByTagName("comment")[i].getAttribute("id"));

                        if (dummyNode.getElementsByTagName("comment")[i].getAttribute("id").toString() === this.state.userID.toString()) {
                            console.log("This user has commented.");
                            console.log("Get Elements " + dummyNode.getElementsByTagName("comment")[i].outerHTML);

                            dummyNode.getElementsByTagName("comment")[i].innerHTML = `${this.state.userID}: ${comment}\n<br/>`;

                            for (var j in radios) {
                                if (radios[j].checked) {
                                    dummyNode.getElementsByTagName("comment")[i].setAttribute("viewable", radios[j].value);
                                }

                            }

                            console.log("Get Elements " + dummyNode.getElementsByTagName("comment")[i].innerHTML);

                            newText = dummyNode.innerHTML;


                            this.setState({comment: newText, addingComment: true}, function () {
                                this.handleChange(this.state.report);

                            });


                            console.log("this.addingcomment inside make comment " + this.state.addingComment);
                            console.log(dummyNode.innerHTML);
                            console.log("After comment is done " + this.state.comment);

                            return
                        }
                    }
                }
            }
            /*
            for (var i in dummyNode.getElementsByTagName("comment")) {
                console.log("UID " + this.state.userID);

                console.log(Number(i));

                if (dummyNode.getElementsByTagName("comment")[i] && Number.isInteger(Number(i))) {
                    console.log("Get Attribute Again " + dummyNode.getElementsByTagName("comment")[i].getAttribute("id"));
                    if (dummyNode.getElementsByTagName("comment")[i].getAttribute("id") === this.state.userID) {
                        console.log("This user has commented.");
                        console.log("Get Elements " + dummyNode.getElementsByTagName("comment")[i].innerHTML);
                        console.log("Get Elements doc id " + document.getElementById(this.state.userID)[i].innerHTML);
                        dummyNode.getElementsByTagName("comment")[i].innerHTML = `${this.state.userID}: ${comment}\n<br/>`;

                        for (var j in radios) {
                            if (radios[j].checked) {
                                dummyNode.getElementsByTagName("comment")[i].getAttribute().value = radios[j].value;
                            }

                        }

                        console.log("Get Elements " + dummyNode.getElementsByTagName("comment")[i].innerHTML);

                        newText = dummyNode.innerHTML;


                        this.setState({comment: newText, addingComment: true}, function () {
                            this.handleChange(this.state.report);

                        });




                        console.log("this.addingcomment inside make comment " + this.state.addingComment);
                        console.log(dummyNode.innerHTML);
                        console.log("After comment is done " + this.state.comment);

                        return
                    }
                }
            }
            */
            console.log("This user has not commented.");
            console.log(dummyNode.getElementsByTagName("comments")[0].innerHTML);


            var newInner;

            for (var k in radios) {
                if (radios[k].checked) {
                    newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} viewable = ${radios[k].value} className="comment">${this.state.userID}: ${comment}\n<br/></comment>`);
                }

            }


            console.log("new Inner" + newInner);
            dummyNode.getElementsByTagName("comments")[0].innerHTML = newInner;

            newText = dummyNode.innerHTML;

            console.log("newText Not Yet Commented " + newInner );

            this.setState({comment: newText, addingComment: true}, function () {
                this.handleChange(this.state.report);
                //document.getElementById('commentBox').value = this.state.comment.innerText;
            });
            console.log("this.addingcomment inside make comment " + this.state.addingComment);
            console.log("After comment is done " + this.state.comment);

            //this.handleChange(this.state.report);


        } else {
            console.log("Comments are not already in here.");

            for (var x in radios) {
                if (radios[x].checked) {
                    var comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = ${radios[x].value} class = "comment" >${this.state.userID}: ${comment}\n<br/></comment></comments>`;

                }

            }
            console.log('Comment Special ' + comSpecial);
            console.log('Comment Special Outer ' + comSpecial.outerHTML);
            console.log('comment Made ' + comment);
            //console.log('value ' + value);
            //var currentText = value;
            //var newText = currentText.concat(comSpecial);

            //console.log('newText ' + newText);


            this.setState({comment: comSpecial, addingComment: true}, function () {
                this.handleChange(this.state.report);
                //document.getElementById('commentBox').value = this.state.comment.innerText;
            });

            //this.handleChange(this.state.report);

        }



    };

    searchTextBox = (event) => {
        this.setState({valueAttr: event.target.value});
        // console.log(event)

        if (event.target.value==='') {
            this.setState({searching:false})
        }
        else
            this.setState({searching:true});


        this.setState({textHighlight:{searchText: event.target.value},

        })


    };


    editMode = () => {
        //var x = document.getElementById(`react-quill-${this.props.primaryid}`);
        console.log('editModeOn ' + this.state.editModeOn);
        console.log('primaryID ' + this.props.primaryid);
        if (this.state.editModeOn) {
            //this.setContainer(`react-quill-${this.state.primaryId}-2`);
            var x = document.getElementById(`react-quill-${this.props.primaryid}`);
            console.log("x in " + x);
            x.style.display = "none";
            var y = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            console.log("y in " + y);
            y.style.display = "initial";
            this.setState({editModeOn: false});
            this.saveWork();

            //this.render();
        }
        else {
            //this.setContainer(`react-quill-${this.state.primaryId}`);
            var a = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            console.log("a in " + a);
            a.style.display = "none";
            var b = document.getElementById(`react-quill-${this.props.primaryid}`);
            console.log("b in " + b);
            b.style.display = "initial";
            this.setState({editModeOn: true});
            //this.render();
        }

    };


    clearText= () =>{
        this.setState({valueAttr: ''})
    };

    customToolbar = () => (

        <div id={`react-quill-${this.state.primaryId}`} style={{height: '100px', width: '1060px', padding: '4px', display: "none" }}>

            <select defaultValue="false" className="ql-header" style={{ width: '175px', height: '36px', margin: '4px' }}>
                <option value="1" />
                <option value="2" />
                <option value="false" />
            </select>
            <Button className="ql-colorBackground" value={annotationColors.drug} style={{ padding: '0px', margin: '2px', background: annotationColors.drug}}>
                Drug
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.reaction} style={{ padding: '0px', margin: '2px', background: annotationColors.reaction }}>
                Adverse Reaction
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.dosage} style={{ padding: '0px', margin: '2px', background: annotationColors.dosage }}>
                Dosage
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.age} style={{ padding: '0px', margin: '2px', background: annotationColors.age }}>
                Age
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.sex} style={{ padding: '0px', margin: '2px', background: annotationColors.sex }}>
                Gender
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.weight} style={{ padding: '0px', margin: '2px', background: annotationColors.weight }}>
                Weight
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.indication} style={{ padding: '0px', margin: '2px', background: annotationColors.indication }}>
                Indication
            </Button>
            <Button className="ql-colorBackground" value={annotationColors.interesting} style={{ padding: '0px', margin: '2px', background: annotationColors.interesting }}>
                Interesting
            </Button>
            <Button className="ql-colorBackground" value="" style={{ padding: '0px', margin: '2px', minWidth:'50px', border: '1px solid black',  background: annotationColors.clear }}>
                Clear
            </Button>
            <Button style={{ padding: '0px', margin: '2px', minHeight: '2px', minWidth:'2px', border: '1px solid black', borderRadius: '15px',  background: annotationColors.clear, position: 'absolute', right : 25}}>
                ?
            </Button>

            <div /*style={{position: 'absolute', bottom: 0, right: 0,}}*/>
                <input className="ql-colorBackground pull-right" id="SearchTextbox" value= "Search.." ref={el => this.inputEntry = el} type="text" name="search" value = {this.state.valueAttr}  onClick= {this.clearText} onChange={this.searchTextBox}  style={{verticalAlign: 'absolute', padding: '0px', margin: '0px' }} />
            </div>
        </div>
    );


    customToolbar2 = () => (

        <div id={`react-quill-${this.props.primaryid}-2`} style={{ padding: '6px' }} ref = 'toolbar'>
            <Button id={`edit-${this.props.primaryid}`} style={{color: 'white', background: annotationColors.edit}} onClick = {() => this.editMode()} >
                Edit Report
            </Button>
        </div>
    );

    modules = {
        toolbar: {

            container: `#react-quill-${this.props.primaryid}`,
            handlers: {
                colorBackground: this.colorBackground,
                //commentMade: this.commentMade,
                header: this.setHeaderStyle,

                editModeIsOn: this.editMode

            },
        },
        history: {
            delay: 500,
            maxStack: 500,
            userOnly: true,
        },
    };


    render() {
        console.log("Render");
        const { ...props } = this.props;
        const { activeIndex, caseSensitive, searchText } = this.state.textHighlight;
        const  textToHighlight = this.state.current.reportText;
        // console.log(searchText)

        const searchWords= searchText.split(/\s/).filter(word => word)
        // console.log(searchWords)
        console.log("reportText render" + this.state.current.reportText);
        console.log("Edit Mode " + this.state.editModeOn);
        console.log("State Primary ID " + this.state.primaryId);
        console.log("Props Primary ID " + this.props.primaryid);
        console.log("User ID " + this.state.userID);
        return (
            <div className={`${this.props.classes.pdfView} container`}>
                {/* ====== Quill editor for Annotating the Report Text ====== */}

                <Paper elevation={4} className={this.props.classes.paperWindow}>

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

                </Paper>

                {/* ====== Save Button Area ====== */}
                <div className={this.props.classes.wrapper}>
                    <Button
                        raised
                        color="primary"
                        className={(this.state.success) ? this.props.classes.buttonSuccess : ''}
                        disabled={this.state.saving}
                        onClick={this.saveWork}>
                        Save
                    </Button>

                    <div id = "commentArea" >
                        <div>
                            <textarea id = "commentBox" cols = "120" rows = "5" readOnly>  </textarea>
                        </div>
                        <div style={{padding: '4px'}}>
                           <textarea id = "comment" cols = "120" rows = "5" >  </textarea>
                         </div>

                         <div style={{padding: '4px'} }>
                             <Button onClick={() => this.commentMade()}> Make Note </Button>
                             <form>

                                 <input type ="radio" name = "viewable" value = "private" checked ="yes" style={{padding: '4px'}}/>Private
                                 <input type="radio" name = "viewable" value = "public" style={{padding: '4px'}}/>Public


                             </form>

                         </div>
                    </div>
                    {(this.state.editModeOn) ?
                        (<Button style={{color: 'white', background: annotationColors.edit}} onClick = {() => this.editMode()} >
                            Stop Editing
                        </Button>

                        ) : null
                    }
                    {this.state.saving &&
                    <CircularProgress
                        size={24}
                        className={this.props.classes.buttonProgress}
                    />}

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
        htmlUnescape,
        getComment,},
)(withStyles(styles)(QuillEditor));



