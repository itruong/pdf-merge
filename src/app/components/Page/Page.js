import React from 'react';

export default class Page extends React.Component {
  componentDidMount () {
    document.title = this.props.title ? `Pumoso | ${this.props.title}` : 'Pumoso';
  }

  render () {
    return this.props.children;
  }
};