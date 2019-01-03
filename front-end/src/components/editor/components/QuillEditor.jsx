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

                        var commentHTML = '';

                        if (dummyNode.getElementsByTagName("comments")[0]) {


                            if (dummyNode.getElementsByTagName("comments")[0].getElementsByTagName("comment"))
                            {
                               var text = '';

                                for (var i in dummyNode.getElementsByTagName("comment")) {

                                    if (Number.isInteger(Number(i))) {
                                       if (dummyNode.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                                            || dummyNode.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                                            text = text.concat(dummyNode.getElementsByTagName("comment")[i].innerText);


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

                            var commentFinal = commentHTML.outerHTML;


                            dummyNode.getElementsByTagName("comments")[0].remove();
                            reportHTML = dummyNode.innerHTML;

                            reportText = reportHTML + commentFinal;

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
        }
        else {

            var dummyNode2 = document.createElement('div');
            dummyNode2.innerHTML = this.state.comment;

            if (dummyNode2.getElementsByTagName("comment")) {
                var text = '';

                for (var i in dummyNode2.getElementsByTagName("comment")) {

                    if (Number.isInteger(Number(i))) {
                        if (dummyNode2.getElementsByTagName("comment")[i].id.toString() === this.state.userID.toString()
                            || dummyNode.getElementsByTagName("comment")[i].getAttribute("viewable").toString() === "public") {

                            text = text.concat(dummyNode2.getElementsByTagName("comment")[i].innerText);


                            document.getElementById('commentBox').value = text;

                            //document.getElementById('commentBox').value = text.concat(dummyNode.getElementsByTagName("comments")[0].innerText);
                        }

                    } //else {
                      //  break;
                    //}
                }
            }
            else {

                document.getElementById('commentBox').value = dummyNode.innerText;

            }

            //document.getElementById('commentBox').value = dummyNode.innerText;

            var finalTextComm = this.state.report + this.state.comment;




            this.setState({success: false, addingComment: false,  current: {reportText: finalTextComm}});

        }
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


                            dummyNode.getElementsByTagName("comment")[i].innerHTML = `${this.state.userID}: ${comment}\n<br/>`;

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
                    newInner = dummyNode.getElementsByTagName("comments")[0].innerHTML.concat(`<comment id=${this.state.userID} viewable = ${radios[k].value} className="comment">${this.state.userID}: ${comment}\n<br/></comment>`);
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
                    var comSpecial = `<comments id = 'comment-${this.props.primaryid}'><comment id = ${this.state.userID} viewable = ${radios[x].value} class = "comment" >${this.state.userID}: ${comment}\n<br/></comment></comments>`;

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


    editMode = () => {

        if (this.state.editModeOn) {
            //this.setContainer(`react-quill-${this.state.primaryId}-2`);
            var x = document.getElementById(`react-quill-${this.props.primaryid}`);
            x.style.display = "none";

            var y = document.getElementById(`react-quill-${this.props.primaryid}-2`);
            y.style.display = "initial";

            this.setState({editModeOn: false});
            this.saveWork();

            //this.render();
        }
        else {
            //this.setContainer(`react-quill-${this.state.primaryId}`);
            var a = document.getElementById(`react-quill-${this.props.primaryid}-2`);

            a.style.display = "none";
            var b = document.getElementById(`react-quill-${this.props.primaryid}`);

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

        const { ...props } = this.props;
        const { activeIndex, caseSensitive, searchText } = this.state.textHighlight;
        const  textToHighlight = this.state.current.reportText;


        const searchWords= searchText.split(/\s/).filter(word => word)

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



