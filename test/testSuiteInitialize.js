import React, { Component } from "react";
import Enzyme, { mount, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });

import ClientMock from "./clientMock";
import { query, mutation, setDefaultClient, GraphQL } from "../index-local";
import { basicQuery, basicQueryWithVariables } from "./graphqlConstants";
import GraphQLComponent from "../src/gqlComponent";

export { React, Component, mount, shallow, ClientMock, query, mutation, setDefaultClient, basicQuery, basicQueryWithVariables, GraphQL };
