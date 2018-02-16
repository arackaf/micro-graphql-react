import React, { Component, createElement } from "react";
import Enzyme, { shallow, render, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { action, observable, computed } from "mobx";
import { observer } from "mobx-react";
Enzyme.configure({ adapter: new Adapter() });

class Store {
  @observable val = 0;
}

class Mock {
  called = 0;
  doIt = () => this.called++;
}
const clientObject = new Mock();

@observer
class Wrapper extends Component {
  render() {
    return <Comp1 val={this.props.store.val} />;
  }
}
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
  let store = new Store();
  mount(<Wrapper store={store} />);

  expect(clientObject.called).toBe(0);
  store.val++;
  expect(clientObject.called).toBe(1);
  store.val++;
  expect(clientObject.called).toBe(1);
  store.val++;
  expect(clientObject.called).toBe(2);
});
