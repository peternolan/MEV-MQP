import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Paper from 'material-ui/Paper';
import _ from 'lodash';
import Button from 'material-ui/Button';
import { getReportNarrativeFromID } from '../../../actions/reportActions';
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

    setHeaderStyle(header) {
        this.quill.format('header', header);
    }

    setContainer(container) {

        this.quill.addContainer(container)

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
    }


    display =() =>{
        return <div>
            {/* {this.customToolbar()} */}
            {console.log("ReactQuill " + this.props.primaryid)}
            {console.log("Report text " + this.state.current.reportText)}
            {

                (!this.state.loading)
                    ? <ReactQuill
                        id={`${this.props.primaryid}` || 'react-quill'}
                        value={this.state.current.reportText}
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
        console.log("Handle Change Report Text" + this.state.current.reportText);
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
            console.log('newTag age ' + newTags.age);
            console.log('newTag drug ' + newTags.drug);
            console.log('newTag interesting ' + newTags.interesting);
            this.setState({success: false, current: {reportText: value, tags: newTags}});
        }
        else {
            this.setState({success: false, addingComment: false});
        }
    };

    colorBackground(color) {
        console.log('color background ' + color);
        const { index, length } = this.quill.getSelection();
        this.quill.formatText(index, length, 'background', color);

    };

    commentMade = (value) => {

        var comment = document.getElementById('comment').value;

        var comSpecial = `<p id = ${this.state.userID}>${comment}</p>`;

        console.log('Comment Special ' + comSpecial);
        console.log('comment Made ' + comment);
        console.log('value ' + value);
        var currentText = value;
        var newText = currentText.concat(comSpecial);
        var newTextSecond = currentText + comSpecial;

        console.log('newText ' + newText);
        console.log('newTextSecond ' + newTextSecond);

        this.setState({ current: { reportText: newText}});
        this.setState({ addingComment: true });

        console.log('text after ' + this.state.current.reportText);




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
        if (this.state.editModeOn) {
            this.setContainer(`react-quill-${this.state.primaryId}-2`);
            this.setState({editModeOn: false});

            this.display();
        }
        else {
            this.setContainer(`react-quill-${this.state.primaryId}`);
            this.setState({editModeOn: true});
            this.display();
        }

    };


    clearText= () =>{
        this.setState({valueAttr: ''})

    };

    customToolbar = () => (

        <div id={`react-quill-${this.state.primaryId}`} style={{height: '100px', width: '1060px', padding: '4px' }}>

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


        <div id={`react-quill-${this.props.primaryid}-2`} style={{ padding: '4px' }} ref = 'toolbar'>
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

                editModeOn: this.editMode


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
        // console.log(searchText)

        const searchWords= searchText.split(/\s/).filter(word => word)
        // console.log(searchWords)
        console.log("reportText " + this.state.current.reportText);
        console.log("Edit Mode " + this.state.editModeOn);
        console.log("State Primary ID " + this.state.primaryId);
        console.log("Props Primary ID " + this.props.primaryid);
        console.log("User ID " + this.state.userID);
        return (
            <div className={`${this.props.classes.pdfView} container`}>
                {/* ====== Quil editor for Annotating the Report Text ====== */}

                <Paper elevation={4} className={this.props.classes.paperWindow}>


                    {(!this.state.editModeOn) ? this.customToolbar() : this.customToolbar2()}

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

                    <div style={{padding: '4px'}}>
                        <textarea id = "comment" cols = "120" rows = "5">  </textarea>
                    </div>
                    {console.log("Text in Value " + this.state.current.reportText)}
                    <div style={{padding: '4px'} }>
                        <Button
                            value={this.state.current.reportText}
                            onClick={() => this.commentMade(this.state.current.reportText)}> Make Note </Button>
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
    { getReportNarrativeFromID },
)(withStyles(styles)(QuillEditor));



