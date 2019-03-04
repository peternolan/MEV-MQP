import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {Combobox} from 'react-widgets';
import { executeSearch, getTagsinCase, getReportsInCases, getReportsFromCase, getCaseNameByID, getCaseReports, setSearchedReports, getInstances, getAgeAndCode } from '../../actions/reportActions';
import * as JsSearch from 'js-search';
import "react-widgets/dist/css/react-widgets.css";

import natural from './natural.js';
import TrashIcon from "../../resources/TrashIcon";
import ReadCaseIcon from "../../resources/ReadCaseIcon";
import CaseIcon from "../../resources/CaseIcon";
import * as d3 from "d3";
import styles from "./CaseSummaryStyles.js";
import MEVColors from '../../theme';
import {Collapse} from 'react-collapse';

class CaseSummary extends Component {

  static propTypes = {
    setSearchLoading: PropTypes.func.isRequired,
    returnedIds: PropTypes.array,
    returnedResults: PropTypes.array,
    printSearchResults: PropTypes.func.isRequired,
    changeTab: PropTypes.func.isRequired,
    setSearchedReports: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
    summaryCounter: PropTypes.number,
    caseID: PropTypes.number,
    userID: PropTypes.number.isRequired,
    refresh: PropTypes.bool,
    classes: PropTypes.shape({
      legendEntry: PropTypes.string,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
  }

  static defaultProps = {
    caseID: null,
    summaryCounter: 0,
    match: {
      params: {
        id: null,
      },
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      tags: {},
      catColors: [],
      caseName: '',
      caseDescription: '',
      reportsInCase: [],
      reports:[],
      pieChartData: [],
      barChartData: [],
      highlightedWordsData:[],
      highlightedWords:[],
      caseNarratives:[],
      legendTab:[],
      caseNarrativesData:[],
      searchedReports:[],
      searchOption: '',
      graphdata: 'outc_cod',
      keywordsExposed: false,
      recommendationArray: [],
      recommendationString: undefined,
      refresh: undefined,
    };
  }

  componentWillMount() {
  }

  componentWillReceiveProps(incomingProps) {

    if (this.state.summaryCounter !== incomingProps.summaryCounter || this.state.refresh !== incomingProps.refresh) {

      this.updateSummary();
      this.setState({
        summaryCounter: incomingProps.summaryCounter,
        refresh : incomingProps.refresh,
      });
    }
  }

  componentDidMount() {
    //d3.select(this.refs.wavePath)
    this.props.getCaseNameByID(this.props.caseID)
      .then(rows => this.setState({
        caseName: (rows[0] ? rows[0].name : ''),
        caseDescription: (rows[0] ? rows[0].description : ''),
      }, () => {
        this.updateSummary();
      }));
  }

  componentDidUpdate() {

  }

  getFillColor = (UNK, size) => {
    const percent = Math.min(1 - (UNK / Math.max(size, 1)), 1);
    return this.getColorAtPercent(percent);
  }

  getColorAtPercent = (percent) => {
    const severe = MEVColors.severeLight.slice(1);
    const mid = MEVColors.middleOfGradient.slice(1);
    const notSevere = MEVColors.notSevereLight.slice(1);
    let color1;
    let color2;

    if (mid !== '') {
      if (percent <= 0.5) {
        color1 = severe;
        color2 = mid;
        percent = (1 - (percent * 2));
      } else {
        color1 = mid;
        color2 = notSevere;
        percent = (1 - (percent - 0.5)) * 2;
      }
    } else {
      color1 = severe;
      color2 = notSevere;
    }

    const r = Math.ceil(parseInt(color1.substring(0, 2), 16) * percent + parseInt(color2.substring(0, 2), 16) * (1-percent));
    const g = Math.ceil(parseInt(color1.substring(2, 4), 16) * percent + parseInt(color2.substring(2, 4), 16) * (1-percent));
    const b = Math.ceil(parseInt(color1.substring(4, 6), 16) * percent + parseInt(color2.substring(4, 6), 16) * (1-percent));

    const rDark = Math.ceil((parseInt(color1.substring(0, 2), 16) * percent + parseInt(color2.substring(0, 2), 16) * (1-percent)) * 0.93);
    const gDark = Math.ceil((parseInt(color1.substring(2, 4), 16) * percent + parseInt(color2.substring(2, 4), 16) * (1-percent)) * 0.93);
    const bDark = Math.ceil((parseInt(color1.substring(4, 6), 16) * percent + parseInt(color2.substring(4, 6), 16) * (1-percent)) * 0.93);

    return this.fixHex(r) + this.fixHex(g) + this.fixHex(b);
  }

  fixHex = (x) => {
    x = x.toString(16);
    return (x.length === 1) ? `0${x}` : x;
  }

  getReportTypeData = () => {
    const typeObject = this.state.reportsInCase.reduce((acc, report) => {
      acc[report.type] = (acc[report.type]) ? acc[report.type] + 1 : 1;
      return acc;
    }, {});

    const pieChartData = Object.keys(typeObject).reduce((acc, key) => {
      return acc.concat({ name: key.toUpperCase(), value: typeObject[key] });
    }, []);

    this.setState({
      pieChartData,
    });
  };






  /******* define function  */

  getTagData = () => {

    const stop_words= ["", 'a','about','above','across','after','again','against','all','almost','alone','along','already','also','although','always','among','an','and','another','any','anybody','anyone','anything','anywhere','are','area','areas','around','as','ask','asked','asking','asks','at','away','b','back','backed','backing','backs','be','became','because','become','becomes','been','before','began','behind','being','beings','best','better','between','big','both','but','by','c','came','can','cannot','case','cases','certain','certainly','clear','clearly','come','could','d','did','differ','different','differently','do','does','done','down','down','downed','downing','downs','during','e','each','early','either','end','ended','ending','ends','enough','even','evenly','ever','every','everybody','everyone','everything','everywhere','f','face','faces','fact','facts','far','felt','few','find','finds','first','for','four','from','full','fully','further','furthered','furthering','furthers','g','gave','general','generally','get','gets','give','given','gives','go','going','good','goods','got','great','greater','greatest','group','grouped','grouping','groups','h','had','has','have','having','he','her','here','herself','high','high','high','higher','highest','him','himself','his','how','however','i','if','important','in','interest','interested','interesting','interests','into','is','it','its','itself','j','just','k','keep','keeps','kind','knew','know','known','knows','l','large','largely','last','later','latest','least','less','let','lets','like','likely','long','longer','longest','m','made','make','making','man','many','may','me','member','members','men','might','more','most','mostly','mr','mrs','much','must','my','myself','n','necessary','need','needed','needing','needs','never','new','new','newer','newest','next','no','nobody','non','noone','not','nothing','now','nowhere','number','numbers','o','of','off','often','old','older','oldest','on','once','one','only','open','opened','opening','opens','or','order','ordered','ordering','orders','other','others','our','out','over','p','part','parted','parting','parts','per','perhaps','place','places','point','pointed','pointing','points','possible','present','presented','presenting','presents','problem','problems','put','puts','q','quite','r','rather','really','right','right','room','rooms','s','said','same','saw','say','says','second','seconds','see','seem','seemed','seeming','seems','sees','several','shall','she','should','show','showed','showing','shows','side','sides','since','small','smaller','smallest','so','some','somebody','someone','something','somewhere','state','states','still','still','such','sure','t','take','taken','than','that','the','their','them','then','there','therefore','these','they','thing','things','think','thinks','this','those','though','thought','thoughts','three','through','thus','to','today','together','too','took','toward','turn','turned','turning','turns','two','u','under','until','up','upon','us','use','used','uses','v','very','w','want','wanted','wanting','wants','was','way','ways','we','well','wells','went','were','what','when','where','whether','which','while','who','whole','whose','why','will','with','within','without','work','worked','working','works','would','x','y','year','years','yet','you','young','younger','youngest','your','yours','z'];
    // const highlightedWordsData = [];
    const highlightedRawWords=[];
    var highlightedWords=[];
    const barChartData = Object.keys(this.state.tags).reduce((acc, key) => {
      return acc.concat({
        name: (key.toUpperCase() === 'SEX') ? 'GENDER' : key.toUpperCase(),//why are they replacing SEX with GENDER?
        count: this.state.tags[key].length,
      });
    }, []);

    /********  To get the highlighed words */
    Object.keys(this.state.tags).map((keyName) => {
      var x = this.state.tags[keyName];
      Object.keys(x).map((values) => {
        highlightedRawWords.push(x[values].toLowerCase().split(' '));
      })
    });

      
    /*********** Smooth the 2D array into 1D */
   
    for(var i = 0; i < highlightedRawWords.length; i++){
      highlightedWords = highlightedWords.concat(highlightedRawWords[i]);
    }

    /********* remove trailing commas */
    for(var i = 0; i < highlightedWords.length; i++){
      highlightedWords[i]= highlightedWords[i].replace(/(^,)|(,$)/g, "");
      highlightedWords[i]= highlightedWords[i].replace(/[""().:;|/^%\'5]/g, "");
    }

      /********** remove stop words */
    highlightedWords = highlightedWords.filter( function( el ) {
      return stop_words.indexOf( el ) < 0;
    } );

    /************** count each word */
    var counts = {};
    for (var i = 0; i < highlightedWords.length; i++) {
      var num = highlightedWords[i];
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    /**************  create frequency table sort of data */

    const highlightedWordsData = Object.keys(counts).reduce((acc, key) => {
      return acc.concat({
        name:key,
        count: counts[key],
      });
    }, []);
    this.setState({
      recommendationArray: highlightedWords,
      recommendationString: highlightedWords.join(' '),
      barChartData,
      highlightedWordsData,
      highlightedWords,
    });
  };

  updateSummary = () => {
    this.props.getTagsinCase(this.props.caseID)
      .then((tags) => {
        const combinedTags = tags
                              .filter((d)=>{return d.tags!="{}" && d.tags != "undefined";})
                              .reduce((acc, row) => {
          Object.keys(JSON.parse(row.tags)).forEach((key) => {
            acc[key] = (acc[key])
              ? acc[key].concat(JSON.parse(row.tags)[key])
              : JSON.parse(row.tags)[key];
          });
          return acc;
        }, {});
        this.setState({
          tags: { ...combinedTags },
        }, () => {
          this.updateGraphs();
        });
      });
  };

  getReports = () => {
      /********* reports assigned to the variable */
      this.props.getCaseReports(this.state.caseName, this.props.userID)
          .then((reports)=>{
          return ()=>{return (reports.length > 0) ? this.props.getInstances(reports) : null;}
      });
  };

  //this function is called once for each report in all cases
  updateGraphs = () => {
    /********* reports assigned to the variable */
    this.props.getReportsInCases(this.props.userID, this.state.caseName)
      .then(reports => this.setState({
        reportsInCase: reports,
      }, () => {
        this.getReportTypeData();
        this.getTagData();

         // (reports.length > 0) ? this.props.getInstances(reports) : null;
      }));
  }

  updateReports = () => {
    /********* reports assigned to the variable */
    this.props.getReportsFromCase(this.props.userID, this.state.caseName)
      .then((reports)=>{this.drawChart(reports);}
      );
  }

  getCaseNarratives = () => {

    const caseNarrativesData = Object.keys(this.state.caseNarratives).reduce((acc, key) => {
      return acc.concat({
        name:  this.state.caseNarratives[key].primaryid ,
        count: this.state.caseNarratives[key].report_text,
      });
    }, []);

    this.setState({
      caseNarrativesData,
    });

  }

  /**
   * Changes the first letter of any word in a string to be capital
   * BEING REUSED IN ReportListing.jsx NEED TO DEAL WITH THIS LATER ! DUPLICATE METHODS
   */
  toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  COLORS = {
    supportive: '#0CC8E8',
    primary: '#0CE88E',
    selected: '#ffff00'
  };

  /************ when case changes, update the reports */
  handleCaseChange = () => {

      this.props.updateTab(this.state.caseName);
  };

  /**************** when the search button is pressed,  */
  handleSearchCaseChange = () =>{
    this.props.updateTab('searched reports');
    // this.props.updateSearchedTab(this.state.searchedReports);
  };

  handleDataChange = (event) => {
    this.setState({graphdata: event.target.value});
  };

   /*************** When search option changes call the corresponding function and set the state */
   handleSearchOptionChange = (value) => {
    this.setState({searchOption :value,});
    
    if (value === 'Score Based'){
      this.calculateTfidf();
    }
    else
      this.searchDocs();

  }

  /************** Search and build index to find documents related to highlighted words */
  searchDocs= () => {
    var searchedReports =[];
    var newArr=[];

    if(this.props.allReports){
        var search = new JsSearch.Search('primaryid');
        search.searchIndex = new JsSearch.TfIdfSearchIndex();     
        search.addIndex('report_text');
        search.addDocuments( this.props.allReports);


        if(this.state.highlightedWords.length !== 0) {
         var str = this.state.highlightedWords;
         for (var i = 0, length = str.length; i < length; i++) {
            searchedReports.push(search.search(str[i]));
          }
        }

        /************  converting the 2D object array to 1D */
        for(var i = 0; i < searchedReports.length; i++){
            newArr = newArr.concat(searchedReports[i]);
        }

        searchedReports = newArr;

        /******* Removing duplicate objects from array */
        searchedReports= searchedReports.filter((searchedReports, index, self) =>
          index === self.findIndex((t) => (
            t.primaryid === searchedReports.primaryid
          ))
        );
        this.props.setSearchedReports (searchedReports);

    } 
  }

  /*********** Prepare data for keywords barcharts */
  BarChart = ()  => {    
    const total_bars=4;
    const keywords_count= 20;  
    var counter = 0;
    let all_barCharts = [];
    var data=[];

    
    if (this.state.highlightedWordsData.length > 0){
      const data_all = this.state.highlightedWordsData;
      const data_length =  this.state.highlightedWordsData.length;
      const max_value = data_all.reduce((max, p) => p.count > max ? p.count : max, data_all[0].count)

    data_all.sort((a, b) => a.count > b.count?-1:1)
   
      for (var i=0; i<total_bars;i++){
            // let all_barCharts= []
            for(var j=counter; j<counter+keywords_count && j< data_length;j++){   
              data.push(data_all[j])
            }
      } 
    } 
    return data;
  }
  /* search for recommendations */
  searchRecommendations = () => {
    var results;
    var resultsArr = [];
    var resultIds  = [];
    var arr = [];

    if (this.state.recommendationString.length > 0) {

      this.props.setSearchLoading(true);
      this.props.executeSearch(this.state.recommendationString)
          .then((data) => {
            results = JSON.parse(data);
            var j = 0;

            var allGood = true;
            while (results.results[j] && allGood) {
              if (Number.isInteger(Number(j))) {
                arr.push(results.results[j]);
              } else {
                allGood = false;
              }
              j++;
            }
            j = 0;
            while (arr[j]) {
              var item = arr;
              var i = 0;
              this.props.getAgeAndCode(arr[j].id).then((rows) => {
                if (rows.length > 0) {


                  var age;
                  var code;
                  age = rows[0].age_year;
                  code = rows[0].outc_cod[0];


                  if (!age) {
                    age = "--";
                  }
                  if (!code) {
                    code = "--";
                  }

                  resultsArr.push({
                    primaryid: item[i].id,
                    drugname: item[i].drugname,
                    sex: item[i].sex,
                    me_type: item[i].error,
                    excerpt: item[i].report_text_highlights,
                    age_year: age,
                    outc_cod: code
                  });
                  resultIds.push(item[i].id);
                  if (resultsArr.length >= arr.length && resultIds.length >= arr.length) {
                    /* Made it? */
                    this.handleSearchResults(resultsArr, resultIds, this.state.recommendationString);
                  }
                }

                i++;
              });

              j++;

            }
          });
    }

  }
  /* back propagate results to list */
  handleSearchResults = (array1, array2, string) => {
    this.props.printSearchResults(array1,array2,string);
    this.props.changeTab(1);
  }
  /* Toggle the hiding of keyword section */
  handleKeywordHide = () => {
    this.setState({
      keywordsExposed: !this.state.keywordsExposed,
    });
  }
  /* Toggle a word's activation for recommendations */
  toggleWord = (event) => {
    var strchk = event.target.getAttribute('value');
    var index = this.state.recommendationArray.indexOf(strchk);
    if (index > -1){
      var rmdrec = this.state.recommendationArray;
      rmdrec.splice(index,1);
      this.setState({
        recommendationArray: rmdrec,
        recommendationString: this.state.recommendationArray.join(' '),
      });
    } else {
      this.setState({
        recommendationArray: [...this.state.recommendationArray, strchk],
        recommendationString: this.state.recommendationArray.join(' '),
      });
    }
  }
  /* Illustrate graphs with d3 */
  drawChart = (reports) => {
    function fmt(data){
      var data2 = [],keys = [];
      for(let key in data){
        data2.push(data[key]);
        keys.push(key);
      }
      var vals = []
      for(let datum of data2){
        vals.push([]);
        var cumsum = 0;
        for(let key in datum){
          vals[vals.length-1].push({"label":key,"start":cumsum, "end":datum[key] + cumsum});
          cumsum += datum[key];
        }
        if(cumsum < reports.length){vals[vals.length-1].push({"label":"Unknown","start":cumsum, "end":reports.length});}//if any of the data is not undefined, we must show this.
      }
      return {"fields":keys, "counts":vals};
    };
    var data = this.props.getInstances(reports);
    var formatted_data = fmt(data);

    var label = d3.select(this.refs.options).node().value;
    console.log('label ' + label);


    if (document.getElementById('legend-' + this.props.caseID)) {

      var legendCont = ``;

      switch (label) {
        case 'sex':
          console.log('Switch ' + label);
          console.log(formatted_data.counts[formatted_data.fields.indexOf(label)]);
          for (var w = 0 ; w < formatted_data.counts[formatted_data.fields.indexOf('sex')].length; w++ ) {
            legendCont +=
                `<div className = {this.props.classes.legendEntry} style  = 'margin-left: ${'1%'}; background-color : ${"#"+this.getFillColor(w, formatted_data.counts[formatted_data.fields.indexOf('sex')].length)}' >
                    ${ formatted_data.counts[formatted_data.fields.indexOf('sex')][w].label}</div>`


          }
          document.getElementById('legend-' + this.props.caseID).innerHTML = `<div>Legend:</div>` + legendCont;

          break;
        case 'age_year':
          console.log('Switch ' + label);
          console.log(formatted_data.counts[formatted_data.fields.indexOf(label)]);
          for (var xx = 0 ; xx < formatted_data.counts[formatted_data.fields.indexOf('age_year')].length; xx++ ) {

            legendCont +=
                `<div className = ${this.props.classes.legendEntry} style  = 'margin-left: ${'1%'}; background-color : ${"#"+this.getFillColor(xx, formatted_data.counts[formatted_data.fields.indexOf('age_year')].length)}' >
                    ${ formatted_data.counts[formatted_data.fields.indexOf('age_year')][xx].label}</div>`


          }
          document.getElementById('legend-' + this.props.caseID).innerHTML = `<div>Legend:</div>` + legendCont;
          break;
        case 'me_type':
          console.log('Switch ' + label);
          console.log(formatted_data.counts[formatted_data.fields.indexOf(label)]);
          for (var y = 0 ; y < formatted_data.counts[formatted_data.fields.indexOf('me_type')].length; y++ ) {
            legendCont +=
                `<div className = ${this.props.classes.legendEntry} style  = 'margin-left: ${'1%'}; background-color : ${"#"+this.getFillColor(y, formatted_data.counts[formatted_data.fields.indexOf('me_type')].length)}' >
                    ${ formatted_data.counts[formatted_data.fields.indexOf('me_type')][y].label}</div>`


          }

          document.getElementById('legend-' + this.props.caseID).innerHTML = `<div>Legend:</div>` + legendCont;
          break;
        case 'outc_cod':
          console.log('Switch ' + label);
          console.log(formatted_data.counts[formatted_data.fields.indexOf(label)]);
          for (var z = 0 ; z < formatted_data.counts[formatted_data.fields.indexOf('outc_cod')].length; z++ ) {
            legendCont +=
                `<div className = ${this.props.classes.legendEntry} style  = ' margin-left: ${'1%'}; background-color : ${"#"+this.getFillColor(z, formatted_data.counts[formatted_data.fields.indexOf('outc_cod')].length)}' >
                    ${ formatted_data.counts[formatted_data.fields.indexOf('outc_cod')][z].label}</div>`


          }
          document.getElementById('legend-' + this.props.caseID).innerHTML = `<div>Legend:</div>` + legendCont;
          break;
        default:
          document.getElementById('legend-' + this.props.caseID).innerHTML = ``;
          break;
      }
    }
      else {
        console.log('NOT HERE')
      }

    if (label == "TODO"){
      return;
    }
    var counts = formatted_data["counts"][formatted_data["fields"].indexOf(label)];
    if(counts.length == 0){return;}

    var svg = d3.select(this.refs.svg);

    var bounds = d3.select(this.refs.bargraph).node().getBoundingClientRect();
    var x = d3.scaleLinear()
      .domain([0,1])
      .range([0, 100]);

    var chart = svg
        .selectAll("g.bar")//for each bar, append a new group
        .data([label], d=>d);

    chart.exit().remove();

    chart.enter()
        .append("g")
        .attr("class", d=>d+ " bar")
        .attr("transform", (d,i)=>{return "translate("+ 0+","+(20*i)+")"});

    var total_reports = reports.length;
    let rects = svg.selectAll("rect.new")//select all rects not marked for deletion (they may be marked from the previous step)
        .data(counts);//create our initial rect selection

    let newrects = rects.enter()
        .append("rect")//add new rects for all new data elements
        .attr("class", "new")
        .attr("y", 0)
        .attr("stroke-width", 1)
        .attr("stroke", "#FFF")
        .attr("opacity", 1)
        .attr("height", 100)
        .attr("x", d=>{return x(d.start/total_reports) > 50 ? 100 : 0;})//preset the x position of new elements to "push" them against the edges for a smoother animation
    
    let firsttime = (rects.nodes().length == 0) && (newrects.nodes().length < 10)
    
    newrects = newrects.merge(rects)//update both old and new rects at this point

    if(newrects.nodes().length > 10){ //conditionally either animate or just set the new rects, based on how many there are (to avoid unnecessary lag)
      newrects
        .attr("height", 100)
        .attr("x", d=>x(d.start/total_reports))
        .attr("width", d=> x((d.end-d.start)/total_reports))//x((d.end-d.start)/total_reports))
        .attr("fill", (d,i)=>{
            //catcolors.push([d.label,"#"+this.getFillColor(i,counts.length),(d.end-d.start)])
            return "#"+this.getFillColor(i,counts.length)
          })
    }
    else {
      if(false && firsttime){ // if this is the first time (AND there are less than 10 nodes) then "grow" the bars from the top
        newrects.attr("height",0)
          .attr("x", d=>x(d.start/total_reports))
          .attr("width", d=> x((d.end-d.start)/total_reports))
          .attr("fill", (d,i)=>{
            //catcolors.push([d.label,"#"+this.getFillColor(i,counts.length),(d.end-d.start)])
            return "#"+this.getFillColor(i,counts.length)
          })
          .transition("update")
          .attr("height", 100);
      }
      else{
          newrects.attr("height", 100)
            .transition("update")
            .attr("x", d=>x(d.start/total_reports))
            .attr("width", (d,i)=> x((d.end-d.start)/total_reports))
            .attr("fill", (d,i)=>{
              //catcolors.push([d.label,"#"+this.getFillColor(i,counts.length),(d.end-d.start)])
              return "#"+this.getFillColor(i,counts.length)
            });
      }
    }

    let oldrects = rects.exit();

    if(oldrects.nodes().length > 10){ //conditionally either animate or just set the new rects, based on how many there are (to avoid unnecessary lag)
      oldrects.remove()
    } else {
      oldrects.attr("class", "old") //mark these as "old", so they don't accidentally end up in the next transition if one begins within 0.25 seconds
      oldrects.attr("stroke", null)
              .transition("end")
              .attr("opacity", 0)
              .remove();//remove all old rects which we haven't updated
    }
  };

  render(){{
            this.getReports();
            this.updateReports();
            }
    return (
      <div key={this.state.caseName} className={this.props.classes.summaryContent} >
          <div key="upper_part" style={{paddingLeft: 10}}>
            <div className={this.props.classes.reportBox}>
              <Typography variant='button' className={this.props.classes.countText}>Total Count of Reports: {this.state.reportsInCase.length}</Typography>
              <Typography id={this.state.caseName + 'casebutton'} type='button' className={this.props.classes.caseButton} onClick={this.handleCaseChange}>show reports</Typography>
            </div>
            <Typography variant='button' className={this.props.classes.caseBDText}>Case Breakdown:
              <select disabled={(this.state.reportsInCase.length > 0) ? false : true} ref='options' value={this.state.graphdata} onChange={this.handleDataChange} className={this.props.classes.dataSelector}>
                <option key='pvs' value='TODO'>Primary v. Supportive</option>
                <option key='outc_cod' value='outc_cod'>Outcome Code</option>
                <option key='me_type' value='me_type'>Medication Error</option>
                <option key='sex' value='sex'>Patient Sex</option>
                <option key='age_year' value='age_year'>Subject Age</option>
              </select>
            </Typography>
          </div>
        <div className={this.props.classes.legend} key = "legend" id ={'legend-' + this.props.caseID} ref = 'legend'>Legend</div>
          <div className={this.props.classes.bargraph} key="bargraph" id='bargraph' ref='bargraph'><svg ref="svg" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%" height='100%'></svg> </div>
        <div className={this.props.classes.bglegend} key='bglegend'>
          {this.state.catColors.map((category) => {

            return (<div className={this.props.classes.legendPair}><div className={this.props.classes.legendColor} style={{backgroundColor:category[1]}}/><Typography className={this.props.classes.legendCategory}>{category[0]} ({category[2]})</Typography></div>)
          })}
        </div>
        <div className={this.props.classes.keywordHead}>
          <Typography variant='button' className={this.props.classes.textButton} onClick={this.handleKeywordHide}>Keyword Summary</Typography>
          <Typography variant='button' onClick={this.searchRecommendations} className={this.props.classes.recButton}>get recommendations</Typography>
        </div>
        <Collapse isOpened={this.state.keywordsExposed}>
          <div className={this.props.classes.keywordContainer}>
            <div key="highlighted_words">
              {(this.state.highlightedWordsData.length === 0) ? 
              <Typography variant='body1' style={{padding: 5, paddingLeft: 15}}>There are no annotated reports in this case for us to build keywords from; try annotating one of the reports.</Typography>
              : this.state.highlightedWordsData.map((word) =>{
                return(
                  <div key={word.name} className={this.props.classes.keywordCapsule}
                       style={{backgroundColor: (this.state.recommendationArray.indexOf(word.name) > -1) ? '#7bd389' : '#ee7674'}} onClick={this.toggleWord}>
                    <Typography value={word.name} variant='body1'>{word.name} ({word.count})</Typography>
                  </div>
                )
              })}
            </div>
          </div>
        </Collapse>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  userID: state.user.userID,
  allReports: state.all_reports.all_reports
});



/**
 * Conect this component to the Redux global State.
 * Maps Redux state to this comonent's props.
 * Gets Redux actions to be called in this component.
 * Exports this component with the proper JSS styles.
 */
export default withStyles(styles)(connect(
  mapStateToProps,
  { executeSearch, 
    getTagsinCase, 
    getReportsFromCase, 
    getReportsInCases, 
    getCaseNameByID , 
    getCaseReports, 
    setSearchedReports, 
    getInstances, 
    getAgeAndCode}
)(CaseSummary));

