import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, pause, dataPacket, PropRecorder } from "../testUtils";
import { buildQuery } from "../../src/util";

const queryA = "A";
const queryB = "B";

let client1;

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

const DummyA = () => <div />;
const DummyB = () => <div />;

function ComponentToUse(props) {
  let query1Props = useQuery(buildQuery(queryA, { a: props.a }));
  let query2Props = useQuery(buildQuery(queryB, { b: props.b }));

  props.tracker1 && props.tracker1.setProps(query1Props);
  props.tracker2 && props.tracker2.setProps(query2Props);

  return (
    <div>
      <DummyA {...query1Props} />
      <DummyB {...query2Props} />
    </div>
  );
}

test("loading props passed", async () => {
  let wrapper = mount(<ComponentToUse a={"a"} b={"b"} unused={0} />);

  verifyPropsFor(wrapper, DummyA, loadingPacket);
  verifyPropsFor(wrapper, DummyB, loadingPacket);
});

test("Resolve both promises", async () => {
  client1.generateResponse = query => ({ data: { tasks: [{ name: query }] } });

  let tracker1 = new PropRecorder();
  let tracker2 = new PropRecorder();
  let wrapper = mount(<ComponentToUse {...{ tracker1, tracker2 }} a={"a"} b={"b"} unused={0} />);

  await pause(wrapper);

  expect(tracker1.currentProps).toMatchObject(dataPacket({ tasks: [{ name: queryA }] }));
  expect(tracker2.currentProps).toMatchObject(dataPacket({ tasks: [{ name: queryB }] }));
});

const getDeferreds = howMany => Array.from({ length: howMany }, () => deferred());

const getDataFunction = (As, Bs) => query => {
  let A = As;
  let B = Bs;

  if (query == queryA) {
    return A.pop();
  } else if (query == queryB) {
    return B.pop();
  }
};

test("Resolve both promises in turn", async () => {
  let [a1, a2, b1, b2] = getDeferreds(4);
  client1.generateResponse = getDataFunction([a2, a1], [b2, b1]);

  let tracker1 = new PropRecorder();
  let tracker2 = new PropRecorder();
  let wrapper = mount(<ComponentToUse {...{ tracker1, tracker2 }} a={"a"} b={"b"} unused={0} />);

  expect(tracker1.currentProps).toMatchObject(loadingPacket);
  expect(tracker2.currentProps).toMatchObject(loadingPacket);

  await resolveDeferred(a1, { data: { tasks: [{ name: "a1" }] } }, wrapper);

  expect(tracker1.currentProps).toMatchObject(dataPacket({ tasks: [{ name: "a1" }] }));
  expect(tracker2.currentProps).toMatchObject(loadingPacket);

  await resolveDeferred(b1, { data: { tasks: [{ name: "b1" }] } }, wrapper);

  expect(tracker1.currentProps).toMatchObject(dataPacket({ tasks: [{ name: "a1" }] }));
  expect(tracker2.currentProps).toMatchObject(dataPacket({ tasks: [{ name: "b1" }] }));

  wrapper.setProps({ a: 2, b: 2 });
  wrapper.update();

  expect(tracker1.currentProps).toMatchObject({ ...dataPacket({ tasks: [{ name: "a1" }] }), loading: true });
  expect(tracker2.currentProps).toMatchObject({ ...dataPacket({ tasks: [{ name: "b1" }] }), loading: true });

  await resolveDeferred(a2, { data: { tasks: [{ name: "a2" }] } }, wrapper);
  await resolveDeferred(b2, { data: { tasks: [{ name: "b2" }] } }, wrapper);

  expect(tracker1.currentProps).toMatchObject(dataPacket({ tasks: [{ name: "a2" }] }));
  expect(tracker2.currentProps).toMatchObject(dataPacket({ tasks: [{ name: "b2" }] }));
});
