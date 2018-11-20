import { React, Component, mount, ClientMock, GraphQL, setDefaultClient, basicQuery, Cache, useQuery } from "../testSuiteInitialize";
import { getPropsFor, verifyPropsFor, deferred, dataPacket, resolveDeferred } from "../testUtils";

let client1;
let client2;
let client3;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  client2 = new ClientMock("endpoint2");
  client3 = new ClientMock("endpoint3");
  setDefaultClient(client1);
});

const Dummy = () => <div />;

const getComponent = options => props => {
  let queryProps = useQuery([basicQuery, { page: props.page }, options]);
  return <Dummy {...queryProps} />;
};

describe("Disable caching", () => {
  test("Explicit cache with size zero", async () => {
    let noCache = new Cache(0);
    let Component = getComponent({ cache: noCache });
    let p = (client1.nextResult = deferred());
    let wrapper = mount(<Component page={1} unused={10} />);
    await resolveDeferred(p, { data: { tasks: [{ id: 1 }] } });
    let wrapper2 = mount(<Component page={1} unused={10} />);

    expect(client1.queriesRun).toBe(2);
  });

  test("Client with cacheSize zero", async () => {
    let noCacheClient = new ClientMock({ cacheSize: 0 });
    let Component = getComponent({ client: noCacheClient });
    let p = (client1.nextResult = deferred());
    let wrapper = mount(<Component page={1} unused={10} />);
    await resolveDeferred(p, { data: { tasks: [{ id: 1 }] } });
    let wrapper2 = mount(<Component page={1} unused={10} />);

    expect(noCacheClient.queriesRun).toBe(2);
  });

  test("Client with noCaching set", async () => {
    let noCacheClient = new ClientMock({ noCaching: true });
    let Component = getComponent({ client: noCacheClient });
    let p = (client1.nextResult = deferred());
    let wrapper = mount(<Component page={1} unused={10} />);
    await resolveDeferred(p, { data: { tasks: [{ id: 1 }] } });
    let wrapper2 = mount(<Component page={1} unused={10} />);

    expect(noCacheClient.queriesRun).toBe(2);
  });
});
