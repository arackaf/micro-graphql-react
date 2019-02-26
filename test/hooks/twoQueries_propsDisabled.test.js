import { React, Component, mount, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, pause, dataPacket, defaultPacket } from "../testUtils";
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
  let query1Props = useQuery(buildQuery(queryA, { a: props.a }, { active: props.activeA }));
  let query2Props = useQuery(buildQuery(queryB, { b: props.b }, { active: props.activeB }));

  return (
    <div>
      <DummyA {...query1Props} />
      <DummyB {...query2Props} />
    </div>
  );
}

test("loading props passed", async () => {
  let wrapper = mount(<ComponentToUse a={"a"} b={"b"} unused={0} activeA={false} activeB={false} />);

  verifyPropsFor(wrapper, DummyA, defaultPacket);
  verifyPropsFor(wrapper, DummyB, defaultPacket);
});

test("Resolve both promises", async () => {
  client1.generateResponse = query => ({ data: { tasks: [{ name: query }] } });
  let wrapper = mount(<ComponentToUse a={"a"} b={"b"} unused={0} activeA={false} activeB={false} />);

  verifyPropsFor(wrapper, DummyA, defaultPacket);
  verifyPropsFor(wrapper, DummyB, defaultPacket);

  await pause(wrapper);

  verifyPropsFor(wrapper, DummyA, defaultPacket);
  verifyPropsFor(wrapper, DummyB, defaultPacket);
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
