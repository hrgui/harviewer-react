import React from 'react';
import { Grid, Row, Col, PageHeader, Alert } from 'react-bootstrap';
import _ from 'lodash';
import * as d3 from 'd3';

import harParser from '../core/har-parser.js'

import HarEntryTable from './har-entry-table/HarEntryTable.jsx';
import FilterBar from './FilterBar.jsx';
import TypePieChart from './pie-chart/TypePieChart.jsx';

import HarActions from '../store/HarActions';
import HarStore from '../store/HarStore';
import FileReaderInput from 'react-file-reader-input';


export default class HarViewer extends React.Component {

  constructor() {
    super();
    this.state = {
      activeHar: HarStore.getState().activeHar,
      filterType: 'all',
      filterText: '',
      sortKey: null,
      sortDirection: null
    };
  }

  render() {
    var content = this.state.activeHar
      ? this._renderViewer(this.state.activeHar)
      : this._renderEmptyViewer();

    return (
      <div>
        {this._renderHeader()}
        {content}
      </div>
    );
  }

  handleChange(e, results) {
    const [[, file], ] = results;

    var reader = new FileReader();
    reader.onload = (e) => {
      let output = e.target.result;
      try {
        let har = JSON.parse(output);
        this.onFileLoaded(har);
      } catch(e) {
        console.error(e);
        alert('not a har file');
      }
    };
    reader.readAsText(file);
  }

  _renderEmptyViewer() {
    return (
      <Grid fluid>
        <Row>
          <Col sm={12}>
            <p></p>
            <Alert bsStyle="warning">
              <strong>No HAR loaded</strong>
            </Alert>
          </Col>
        </Row>
      </Grid>
    );
  }

  _renderHeader() {
    return (
      <Grid fluid>
        <Row>
          <Col sm={9}>
            <PageHeader>Har Viewer</PageHeader>
          </Col>
          <Col sm={3}>
            <FileReaderInput as="text" id="my-file-input"
                          onChange={this.handleChange.bind(this)}>
              <button>Select a file!</button>
            </FileReaderInput>
          </Col>
        </Row>
      </Grid>
    );
  }

  _renderViewer(har) {
    var pages = harParser.parse(har),
      currentPage = pages[0],
      timeScale = this._prepareScale(currentPage.entries, currentPage),
      filter = {
        type: this.state.filterType,
        text: this.state.filterText
      },
      filteredEntries = this._filterEntries(filter, currentPage.entries),
      sortedEntries = this._sortEntriesByKey(this.state.sortKey, this.state.sortDirection, filteredEntries);

      /*
      typepiechart is here
      <Row>
          <Col sm={12}>
            <TypePieChart entries={currentPage.entries} />
          </Col>
        </Row>
        */

    return (
      <Grid fluid>
        <Row>
          <Col sm={12}>
            <FilterBar onChange={this._onFilterChanged.bind(this)}
              onFilterTextChange={this._onFilterTextChanged.bind(this)} />
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <HarEntryTable entries={sortedEntries}
              page={currentPage}
              timeScale={timeScale}
              onColumnSort={this._onColumnSort.bind(this)} />
          </Col>
        </Row>
      </Grid>
    );
  }

  componentDidMount() {
    this._storeListener = this._onStoreChanged.bind(this);
    HarStore.listen(this._storeListener);
  }

  componentWillUnmount() {
    HarStore.unlisten(this._storeListener);
  }

  onFileLoaded(har) {
    HarActions.loadHar(har);
  }

  _onStoreChanged(state) {
    this.setState({
      activeHar: state.activeHar
    });
  }

  _onFilterTextChanged(text) {
    this.setState({ filterText: text });
  }

  _onColumnSort(dataKey, direction) {
    this.setState({ sortKey: dataKey, sortDirection: direction });
  }

  _sortEntriesByKey(dataKey, sortDirection, entries) {
    if (_.isEmpty(dataKey) || _.isEmpty(sortDirection)) return entries;

    var keyMap = {
      url: 'request.url',
      time: 'time.start'
    };
    var getValue = function (entry) {
      var key = keyMap[dataKey] || dataKey;
      return _.get(entry, key);
    };

    var sorted = _.sortBy(entries, getValue); // By default _.sortBy is ascending
    if (sortDirection === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }

  _onFilterChanged(type) {
    this.setState({ filterType: type });
  }

  _filterEntries(filter, entries) {
    return _.filter(entries, function (x) {
      var matchesType = filter.type === 'all' || filter.type === x.type,
        matchesText = _.includes(x.request.url, filter.text);

      return matchesType && matchesText;
    });
  }

  _prepareScale(entries, page) {
    var startTime = 0,
      lastEntry = _.last(entries),
      endTime = lastEntry.time.start + lastEntry.time.total,
      maxTime = Math.max(endTime, page.pageTimings.onLoad);

    var scale = d3.scaleLinear()
      .domain([startTime, Math.ceil(maxTime)])
      .range([0, 100]);

    return scale;
  }
};