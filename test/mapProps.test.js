import React, { Component, createElement } from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });

import ClientMock from "./clientMock";
import { Client, query, mutation, setDefaultClient } from "../index-local";
import { basicQuery, basicQueryWithVariables } from "./graphqlConstants";

const client1 = new ClientMock("endpoint1");

setDefaultClient(client1);

beforeEach(() => {
  client1.reset();
});

const DEFAULT_CACHE_SIZE = 10;

const getComponent = (...args) =>
  @query(...args)
  class extends Component {
    render = () => null;
  };

const BasicQuery = getComponent(props => ({
  query: basicQuery
}));

const basicQueryWithVariablesPacket = props => ({
  query: basicQueryWithVariables,
  variables: { page: props.page }
});

test("Static query never re-fires", () => {
  let Component = getComponent(basicQueryWithVariablesPacket, {
    mapProps: ({ loading, loaded, data, error }) => ({ loadingX: loading, loadedX: loaded, dataX: data, errorX: error })
  });
  let obj = mount(<Component />);

  expect(obj.childAt(0).props()).toMatchObject({
    loadingX: true,
    loadedX: false,
    dataX: null,
    errorX: null
  });
});

test("Static query never re-fires", async () => {
  let Component = getComponent(basicQueryWithVariablesPacket, {
    mapProps: ({ loading, loaded, data, error }) => ({ loadingX: loading, loadedX: loaded, dataX: data, errorX: error })
  });
  let results = { data: { allBooks: [{ title: "Hello" }] } };
  client1.nextResult = new Promise(res => res(results));

  let obj = mount(<Component />);
  expect(obj.childAt(0).props()).toMatchObject({
    loadingX: true,
    loadedX: false,
    dataX: null,
    errorX: null
  });

  await client1.nextResult;

  obj.update();
  expect(obj.childAt(0).props()).toMatchObject({
    loadingX: false,
    loadedX: true,
    dataX: results.data,
    errorX: null
  });
});
