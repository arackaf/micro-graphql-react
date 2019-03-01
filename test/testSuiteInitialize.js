import React, { Component } from "react";
import Enzyme, { mount, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
Enzyme.configure({ adapter: new Adapter() });

import ClientMock from "./clientMock";
import { query, mutation, setDefaultClient, GraphQL } from "../src/index";
import { basicQuery, basicQueryWithVariables } from "./graphqlConstants";
import GraphQLComponent, { buildQuery } from "../src/gqlComponent";
import useQuery from "../src/useQuery";
import useMutation from "../src/useMutation";
import Cache from "../src/cache";

export {
  React,
  Component,
  mount,
  shallow,
  ClientMock,
  query,
  mutation,
  setDefaultClient,
  basicQuery,
  basicQueryWithVariables,
  GraphQL,
  buildQuery,
  Cache,
  useQuery,
  useMutation
};
