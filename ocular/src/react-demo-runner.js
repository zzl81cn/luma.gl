import {Component} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  demo: PropTypes.object,
  canvas: PropTypes.string
};

const defaultProps = {
  canvas: 'demo-canvas'
};

export default class DemoRunner extends Component {

  componentDidMount() {
    this.props.demo.start({
      canvas: this.props.canvas
      // debug: true
    });
  }

  componentWillUnmount() {
    this.props.demo.stop();
  }

  render() {
    const {width, height} = this.props;
    return (
      <canvas id={this.props.canvas} style={{width, height, padding: 0, border: 0}}/>
    );
  }

}

DemoRunner.propTypes = propTypes;
DemoRunner.defaultProps = defaultProps;
