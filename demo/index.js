import React, { Component } from "react";
import { render } from "react-dom";
import o from "../index";

const dec = Class =>
  class extends Component {
    render() {
      return (
        <div>
          <Class val={o.val} />
        </div>
      );
    }
  };

@dec
class Foo extends Component {
  render() {
    return <div>{this.props.val}</div>;
  }
}

render(<Foo val={1} />, document.getElementById("home"));
