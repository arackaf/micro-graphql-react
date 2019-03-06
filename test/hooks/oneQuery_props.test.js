import { React, mount, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, dataPacket, errorPacket, rejectDeferred, pause } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const Dummy = () => <div />;

function ComponentToUse(props) {
  let queryProps = useQuery([queryA, { a: props.a }]);
  return <Dummy {...queryProps} />;
}

test("loading props passed", async () => {
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);
  verifyPropsFor(wrapper, Dummy, loadingPacket);
});

test("Query resolves and data updated", async () => {
  let p = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(wrapper, Dummy, loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  let p = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(wrapper, Dummy, loadingPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] }, wrapper);
  verifyPropsFor(wrapper, Dummy, errorPacket([{ msg: "a" }]));
});

test("Error in promise", async () => {
  let p = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  verifyPropsFor(wrapper, Dummy, loadingPacket);

  await rejectDeferred(p, { message: "Hello" }, wrapper);
  await pause(wrapper);
  verifyPropsFor(wrapper, Dummy, errorPacket({ message: "Hello" }));
});

test("Out of order promise handled", async () => {
  let pFirst = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  wrapper.setProps({ a: 2 });

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
});

test("Out of order promise handled 2", async () => {
  let pFirst = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  let pSecond = (client1.nextResult = deferred());
  wrapper.setProps({ a: 2 });

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, loadingPacket);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
});

test("Cached data handled", async () => {
  let pData = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  wrapper.setProps({ a: 2 });

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 2 }] }));

  wrapper.setProps({ a: 1 });
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  expect(client1.queriesRun).toBe(2);
});

test("Cached data while loading handled", async () => {
  let pData = (client1.nextResult = deferred());
  let wrapper = mount(<ComponentToUse a={1} unused={0} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  wrapper.setProps({ a: 2 });
  wrapper.update();
  verifyPropsFor(wrapper, Dummy, { ...dataPacket({ tasks: [{ id: 1 }] }), loading: true });

  await pause(wrapper);
  wrapper.setProps({ a: 1 });
  wrapper.update();
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
});
