import _ from 'lodash';

export default class Page {
  constructor(harPage) {
    this.id = harPage.id;
    this.startedDateTime = harPage.startedDateTime;
    this.pageTimings = _.clone(harPage.pageTimings);
    this.entries = [];
  }
}
