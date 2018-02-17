import React, { Component, createElement } from "react";
import Enzyme, { shallow, render, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });

import ClientMock from "./clientMock";
import { Client, query, mutation, setDefaultClient } from "../index-local";
import { basicQuery, basicQueryWithVariables } from "./graphqlConstants";

const client1 = new ClientMock("endpoint1");
const client2 = new ClientMock("endpoint2");

setDefaultClient(client1);

beforeEach(() => {
  client1.reset();
  client2.reset();
});

@query(props => ({
  query: basicQuery
}))
class BasicQuery extends Component {
  render = () => null;
}

@query(props => ({
  query: basicQueryWithVariables,
  variables: { page: props.page }
}))
class BasicQueryWithVariables extends Component {
  render = () => null;
}

test("Static query never re-fires", () => {
  let obj = mount(<BasicQuery unused={0} />);

  expect(client1.queriesRun).toBe(1);
  obj.setProps({ unused: 1 });
  expect(client1.queriesRun).toBe(1);
});

test("Query with variables re-fires", async () => {
  let obj = mount(<BasicQueryWithVariables page={1} />);

  expect(client1.queriesRun).toBe(1);
  obj.setProps({ page: 2 });
  expect(client1.queriesRun).toBe(2);
});
