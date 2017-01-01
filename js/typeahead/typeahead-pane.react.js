// @flow

import React from 'react';
import invariant from 'invariant';
import update from 'immutability-helper';

import TypeaheadCalendarOption from './typeahead-calendar-option.react';

type Props = {
  paneTitle: string,
  pageSize: number,
  totalResults: number,
  resultsBetween: (start: number, end: number) => TypeaheadCalendarOption[],
};
type State = {
  currentPage: number,
  currentResults: TypeaheadCalendarOption[],
};

class TypeaheadPane extends React.Component {

  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      currentPage: 0,
      currentResults: this.props.resultsBetween(
        this.firstIndex(0),
        this.secondIndex(0),
      ),
    };
    invariant(
      this.state.currentResults.length <= props.pageSize,
      "results larger than page size",
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.resultsBetween !== nextProps.resultsBetween) {
      this.setState((prevState, props) => {
        return update(prevState, {
          currentResults: { $set: props.resultsBetween(
            this.firstIndex(prevState.currentPage),
            this.secondIndex(prevState.currentPage),
          ) },
        });
      });
    }
  }

  firstIndex(page: number) {
    return this.props.pageSize * page;
  }

  secondIndex(page: number) {
    return Math.min(this.props.pageSize * (page + 1), this.props.totalResults);
  }

  render() {
    if (this.props.totalResults === 0) {
      return null;
    }
    let pager = null;
    if (this.props.totalResults > this.state.currentResults.length) {
      let leftPager = (
        <svg
          height="13px"
          width="13px"
          className="calendar-nav-pager-svg"
          viewBox="0 0 512 512"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <polygon points={
            "352,128.4 319.7,96 160,256 160,256 160,256 319.7,416 " +
            "352,383.6 224.7,256"
          }/>
        </svg>
      );
      if (this.state.currentPage > 0) {
        leftPager = (
          <a
            href="#"
            className="calendar-nav-pager-button"
            onClick={this.onBackPagerClick.bind(this)}
          >{leftPager}</a>
        );
      }
      let rightPager = (
        <svg
          height="13px"
          width="13px"
          className="calendar-nav-pager-svg"
          viewBox="0 0 512 512"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <polygon points={
            "160,128.4 192.3,96 352,256 352,256 352,256 192.3,416 " +
            "160,383.6 287.3,256 "
          }/>
        </svg>
      );
      if (
        this.props.pageSize * (this.state.currentPage + 1)
          < this.props.totalResults
      ) {
        rightPager = (
          <a
            href="#"
            className="calendar-nav-pager-button"
            onClick={this.onNextPagerClick.bind(this)}
          >{rightPager}</a>
        );
      }
      pager = (
        <div className="calendar-nav-pager">
          {leftPager}
          <span className="calendar-nav-pager-status">
            {
              `${this.firstIndex(this.state.currentPage) + 1}–` +
              `${this.secondIndex(this.state.currentPage)} ` +
              `of ${this.props.totalResults}`
            }
          </span>
          {rightPager}
        </div>
      );
    }
    return (
      <div className="calendar-nav-option-pane">
        <div className="calendar-nav-option-pane-header">
          {this.props.paneTitle}
          {pager}
        </div>
        {this.state.currentResults}
      </div>
    );
  }

  onBackPagerClick(event: SyntheticEvent) {
    event.preventDefault();
    invariant(
      this.state.currentPage > 0,
      "can't go back from 0",
    );
    this.setState((prevState, props) => {
      const newPage = prevState.currentPage - 1;
      const newResults = props.resultsBetween(
        this.firstIndex(newPage),
        this.secondIndex(newPage),
      );
      invariant(
        newResults.length <= props.pageSize,
        "results larger than page size",
      );
      return update(prevState, {
        currentPage: { $set: newPage },
        currentResults: { $set: newResults },
      });
    });
  }

  onNextPagerClick(event: SyntheticEvent) {
    event.preventDefault();
    invariant(
      this.props.pageSize * (this.state.currentPage + 1)
        < this.props.totalResults,
      "page is too high",
    );
    this.setState((prevState, props) => {
      const newPage = prevState.currentPage + 1;
      const newResults = props.resultsBetween(
        this.firstIndex(newPage),
        this.secondIndex(newPage),
      );
      invariant(
        newResults.length <= props.pageSize,
        "results larger than page size",
      );
      return update(prevState, {
        currentPage: { $set: newPage },
        currentResults: { $set: newResults },
      });
    });
  }

}

TypeaheadPane.propTypes = {
  paneTitle: React.PropTypes.string.isRequired,
  pageSize: React.PropTypes.number.isRequired,
  totalResults: React.PropTypes.number.isRequired,
  resultsBetween: React.PropTypes.func.isRequired,
};

export default TypeaheadPane;
