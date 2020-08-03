import React, { Component, useRef } from "react";
import { render, cleanup } from "react-testing-library";

import { setDefaultClient, GraphQL } from "../src/index";
import ClientMock from "./clientMock";
import Cache from "../src/cache";
import useQuery from "../src/useQuery";
import useMutation from "../src/useMutation";

export { React, render, cleanup, Component, GraphQL, ClientMock, setDefaultClient, Cache, useQuery, useMutation, useRef };
