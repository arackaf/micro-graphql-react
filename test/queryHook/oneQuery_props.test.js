import { React, Component, mount, shallow, ClientMock, setDefaultClient, GraphQL, useQuery } from "../testSuiteInitialize";
import { verifyPropsFor, deferred, resolveDeferred, loadingPacket, dataPacket, errorPacket, rejectDeferred, pause } from "../testUtils";

const queryA = "A";
const queryB = "B";

let client1;
let ComponentToUse;

class Dummy extends Component {
  render() {
    return <div />;
  }
}

const getComponent = () =>
  function Component() {
    let queryProps = useQuery([queryA, { a: this.props.a }]);
    return (
      <div>
        <Dummy {...queryProps} />
      </div>
    );
  };

beforeEach(() => {
  client1 = new ClientMock("endpoint1");
  setDefaultClient(client1);
});

test("Basic functionality with just string", async () => {
  function HookUser(props) {
    let queryProps = useQuery([queryA, { a: props.a }]);
    return <Dummy {...queryProps} />;
  }
  class ComponentToUse extends Component {
    render() {
      return (
        <div>
          <div>
            <HookUser />
          </div>
        </div>
      );
    }
  }

  let p = (client1.nextResult = deferred());
  let wrapper = mount(<HookUser a={1} unused={0} />);

  verifyPropsFor(wrapper, Dummy, loadingPacket);

  await resolveDeferred(p, { data: { tasks: [] } }, wrapper);
  verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [] }));
});

// test("loading props passed", async () => {
//   ComponentToUse = getComponent();
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   verifyPropsFor(wrapper, Dummy, loadingPacket);
// });

// test("Query resolves and data updated", async () => {
//   ComponentToUse = getComponent();
//   let p = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   verifyPropsFor(wrapper, Dummy, loadingPacket);

//   await resolveDeferred(p, { data: { tasks: [] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [] }));
// });

// test("Query resolves and errors updated", async () => {
//   ComponentToUse = getComponent();
//   let p = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   verifyPropsFor(wrapper, Dummy, loadingPacket);

//   await resolveDeferred(p, { errors: [{ msg: "a" }] }, wrapper);
//   verifyPropsFor(wrapper, Dummy, errorPacket([{ msg: "a" }]));
// });

// test("Error in promise", async () => {
//   ComponentToUse = getComponent();
//   let p = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   verifyPropsFor(wrapper, Dummy, loadingPacket);

//   await rejectDeferred(p, { message: "Hello" }, wrapper);
//   verifyPropsFor(wrapper, Dummy, errorPacket({ message: "Hello" }));
// });

// test("Out of order promise handled", async () => {
//   ComponentToUse = getComponent();
//   let pFirst = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   let pSecond = (client1.nextResult = deferred());
//   wrapper.setProps({ a: 2 });

//   await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

//   await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
// });

// test("Out of order promise handled 2", async () => {
//   ComponentToUse = getComponent();
//   let pFirst = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   let pSecond = (client1.nextResult = deferred());
//   wrapper.setProps({ a: 2 });

//   await resolveDeferred(pFirst, { data: { tasks: [{ id: -999 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, loadingPacket);

//   await resolveDeferred(pSecond, { data: { tasks: [{ id: 1 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
// });

// test("Cached data handled", async () => {
//   ComponentToUse = getComponent();
//   let pData = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

//   pData = client1.nextResult = deferred();
//   wrapper.setProps({ a: 2 });

//   await resolveDeferred(pData, { data: { tasks: [{ id: 2 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 2 }] }));

//   wrapper.setProps({ a: 1 });
//   await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

//   expect(client1.queriesRun).toBe(2);
// });

// test("Cached data while loading handled", async () => {
//   ComponentToUse = getComponent();
//   let pData = (client1.nextResult = deferred());
//   let wrapper = mount(<ComponentToUse a={1} unused={0} />);

//   await resolveDeferred(pData, { data: { tasks: [{ id: 1 }] } }, wrapper);
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));

//   pData = client1.nextResult = deferred();
//   wrapper.setProps({ a: 2 });
//   wrapper.update();
//   verifyPropsFor(wrapper, Dummy, { ...dataPacket({ tasks: [{ id: 1 }] }), loading: true });

//   await pause(wrapper);
//   wrapper.setProps({ a: 1 });
//   wrapper.update();
//   verifyPropsFor(wrapper, Dummy, dataPacket({ tasks: [{ id: 1 }] }));
// });
