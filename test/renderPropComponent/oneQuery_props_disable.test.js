import { render } from "react-testing-library";

import { React, Component, ClientMock, setDefaultClient, GraphQL } from "../testSuiteInitialize";
import { deferred, resolveDeferred, loadingPacket, dataPacket, errorPacket, rejectDeferred, pause, defaultPacket } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;
let getProps;

const getQueryAndMutationComponent = options => {
  let currentProps;
  return [
    () => currentProps,
    class extends Component {
      render() {
        let props = this.props;
        return (
          <GraphQL query={{ query1: [queryA, { a: props.a }, { active: props.active }] }}>
            {props => {
              currentProps = props;
              return null;
            }}
          </GraphQL>
        );
      }
    }
  ];
};

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
  [getProps, ComponentToUse] = getQueryAndMutationComponent();
});

test("loading props passed", async () => {
  render(<ComponentToUse a={1} unused={0} active={false} />);

  expect(getProps().query1).toMatchObject(defaultPacket);
});

test("Query resolves and data updated - freezes if inactive", async () => {
  let p = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={true} />);

  expect(getProps().query1).toMatchObject(loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } });

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [] }));

  rerender(<ComponentToUse a={2} unused={0} active={false} />);

  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [] }));
});

test("Query resolves and errors updated", async () => {
  let p = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={false} />);

  expect(getProps().query1).toMatchObject(defaultPacket);

  await resolveDeferred(p, { errors: [{ msg: "a" }] });
  expect(getProps().query1).toMatchObject(defaultPacket);
});

test("Out of order promise handled", async () => {
  let pFirst = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={false} />);

  let pSecond = (client1.nextResult = deferred());
  rerender(<ComponentToUse a={2} unused={0} active={false} />);

  await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(defaultPacket);

  await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } });
  expect(getProps().query1).toMatchObject(defaultPacket);
});

test("Cached data handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={true} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} active={false} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  rerender(<ComponentToUse a={1} unused={0} active={true} />);
  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  expect(client1.queriesRun).toBe(1);
});

test("Cached data while loading handled", async () => {
  let pData = (client1.nextResult = deferred());
  let { rerender } = render(<ComponentToUse a={1} unused={0} active={true} />);

  await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } });
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));

  pData = client1.nextResult = deferred();
  rerender(<ComponentToUse a={2} unused={0} active={false} />);

  expect(getProps().query1).toMatchObject({ ...dataPacket({ tasks: [{ id: 1 }] }), loading: false });

  await pause();
  rerender(<ComponentToUse a={1} unused={0} active={true} />);
  expect(getProps().query1).toMatchObject(dataPacket({ tasks: [{ id: 1 }] }));
});
