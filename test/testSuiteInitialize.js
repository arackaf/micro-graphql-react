import React, { Component } from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });

import ClientMock from "./clientMock";
import { query, mutation, setDefaultClient } from "../index-local";
import { basicQuery, basicQueryWithVariables } from "./graphqlConstants";

export { React, Component, mount, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables };
