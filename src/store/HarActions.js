import alt from './alt';

class HarActions {

  loadUrl(url) {
    return dispatch => {
      fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          dispatch(data)
        });
    }
  }

  loadHar(har) {
    return dispatch => {
      dispatch(har);
    }
  }
}

export default alt.createActions(HarActions);