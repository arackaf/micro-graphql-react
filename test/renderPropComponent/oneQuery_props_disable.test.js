import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "../testSuiteInitialize";
import {
  verifyPropsFor,
  deferred,
  resolveDeferred,
  loadingPacket,
  dataPacket,
  errorPacket,
  rejectDeferred,
  pause,
  defaultPacket
} from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;

class Dummy extends Component {
  render() {
    return <div />;
  }
}

class ComponentToUse extends Component {
  render() {
    let props = this.props;
    return <GraphQL query={{ query1: [queryA, { a: props.a }, { active: props.active }] }}>{props => <Dummy {...props.query1} />}</GraphQL>;
  }
}

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

test("loading props passed", async () => {
  let wrapper = mount(<ComponentToUse a={1} unused={0} active={false} />);

  verifyPropsFor(wrapper, Dummy, defaultPacket);
});

test("Query resolves and data updated - freezes if inactive", async () => {
  let p = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} active={true} />);

  verifyPropsFor(wrapper, Dummy, loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [] }));

  wrapper.setProps({ a: 2, active: false });
  wrapper.update();

  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  let p = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} active={false} />);

  verifyPropsFor(wrapper, Dummy, defaultPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] }, wrapper);
  verifyPropsFor(wrapper, Dummy, defaultPacket);
});

test("Out of order promise handled", async () => {
  let pFirst = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} active={false} />);

  let pSecond = (client1.nextResult = deferred());
  wrapper.setProps({ a: 2 });

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, defaultPacket);

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, defaultPacket);
});

test("Cached data handled", async () => {
  let pData = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} active={true} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  wrapper.setProps({ a: 2, active: false });

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  wrapper.setProps({ a: 1, active: true });
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  expect(client1.queriesRun).toBe(1);
});

test("Cached data while loading handled", async () => {
  let pData = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} active={true} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  wrapper.setProps({ a: 2, active: false });
  wrapper.update();
  verifyPropsFor(wrapper, Dummy, { ...dataPacket({ tasks: [{ id: 1 }] }), loading: false });

  await pause(wrapper);
  wrapper.setProps({ a: 1, active: true });
  wrapper.update();
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
});
