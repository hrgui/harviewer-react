require('bootstrap/dist/css/bootstrap.css');
//require('bootstrap/dist/css/bootstrap-theme.css');

require('./app.scss');

import HarViewer from './components/HarViewer.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <HarViewer />,
  document.body
);
