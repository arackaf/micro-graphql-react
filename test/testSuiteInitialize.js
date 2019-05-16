import React, { Component } from "react";
import { render } from "react-testing-library";

import { setDefaultClient, GraphQL } from "../src/index";
import ClientMock from "./clientMock";
import Cache from "../src/cache";
import useQuery from "../src/useQuery";
import useMutation from "../src/useMutation";

export { React, render, Component, GraphQL, ClientMock, setDefaultClient, Cache, useQuery, useMutation };
