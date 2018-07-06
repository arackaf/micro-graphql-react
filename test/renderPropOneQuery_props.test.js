import { React, Component, mount, ClientMock, setDefaultClient, GraphQL } from "./testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, dataPacket, errorPacket, rejectDeferred } from "./testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

class Dummy extends Component {
  render() {
    return <div />;
  }
}

const getComponent = () =>
  class extends Component {
    render() {
      return <GraphQL query={{ query1: [queryA, { a: this.props.a }] }}>{props => <Dummy {...props.query1} />}</GraphQL>;
    }
  };

test("loading props passed", async () => {
  ComponentToUse = getComponent();
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, loadingPacket);
});

test("Query resolves and data updated", async () => {
  ComponentToUse = getComponent();
  let p = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  ComponentToUse = getComponent();
  let p = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, loadingPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] }, obj);
  verifyPropsFor(obj, Dummy, errorPacket([{ msg: "a" }]));
});

test("Error in promise", async () => {
  ComponentToUse = getComponent();
  let p = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(obj, Dummy, loadingPacket);

  await rejectDeferred(p, { message: "Hello" }, obj);
  verifyPropsFor(obj, Dummy, errorPacket({ message: "Hello" }));
});

test("Out of order promise handled", async () => {
  ComponentToUse = getComponent();
  let pFirst = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  obj.setProps({ a: 2 });

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
});

test("Out of order promise handled 2", async () => {
  ComponentToUse = getComponent();
  let pFirst = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  obj.setProps({ a: 2 });

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, obj);
  verifyPropsFor(obj, Dummy, loadingPacket);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
});

test("Cached data handled", async () => {
  ComponentToUse = getComponent();
  let pData = (client1.nextResult = deferred());
  let obj = mount(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  obj.setProps({ a: 2 });

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [{ id: 2 }] }));

  obj.setProps({ a: 1 });
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, obj);
  verifyPropsFor(obj, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  expect(client1.queriesRun).toBe(2);
});
