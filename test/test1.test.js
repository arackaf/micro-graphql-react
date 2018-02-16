import React, { Component, createElement } from "react";
import Enzyme, { shallow, render, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });

class Mock {
  called = 0;
  doIt = () => this.called++;
}
const clientObject = new Mock();

class Comp1 extends Component {
  componentDidUpdate(prevProps, prevState) {
    if (this.props.val % 2 === 1) {
      //hard coded - in real life the client library will be put here by my
      //library, which I'm testing
      clientObject.doIt();
    }
  }
  render() {
    return null;
  }
}

test("test1", () => {
  let obj = mount(<Comp1 val={0} />);

  expect(clientObject.called).toBe(0);
  obj.setProps({ val: 1 });
  expect(clientObject.called).toBe(1);
  obj.setProps({ val: 2 });
  expect(clientObject.called).toBe(1);
  obj.setProps({ val: 3 });
  expect(clientObject.called).toBe(2);
});
