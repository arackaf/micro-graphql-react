import { useQuery, useMutation } from "../src";

export const getPropsFor = (wrapper, target) =>
  wrapper
    .children()
    .find(target)
    .props();

export const verifyPropsFor = (wrapper, target, expected) => {
  let props = getPropsFor(wrapper, target);
  expect(props).toMatchObject(expected);
};

export const deferred = () => {
  let resolve, reject;
  let p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  p.resolve = resolve;
  p.reject = reject;
  return p;
};

export const resolveDeferred = async (p, val, wrapper) => {
  p.resolve(val);
  await p;
  wrapper && wrapper.update();
};

export const rejectDeferred = async (p, val, wrapper) => {
  p.reject(val);
  try {
    await p;
  } catch (er) {}
  wrapper && wrapper.update();
};

export const defaultPacket = {
  loading: false,
  loaded: false,
  data: null,
  error: null
};

export const loadingPacket = {
  loading: true,
  loaded: false,
  data: null,
  error: null
};

export const dataPacket = data => ({
  loading: false,
  loaded: true,
  error: null,
  data
});

export const errorPacket = error => ({
  loading: false,
  loaded: true,
  error,
  data: null
});

export const pause = wrapper =>
  new Promise(res =>
    setTimeout(() => {
      wrapper && wrapper.update();
      res();
    }, 10)
  );

export const hookComponentFactory = (...args) => (...options) => {
  let howManyHooks = args.length;
  let currentProps = Array.from({ length: howManyHooks }, () => ({}));
  let lambdas = currentProps.map((o, i) => () => currentProps[i]);

  return [
    ...lambdas,
    props => {
      args.forEach((packet, i) => {
        if (Array.isArray(packet)) {
          currentProps[i] = useQuery([packet[0], packet[1] ? packet[1](props) : {}, options[i]]);
        } else {
          currentProps[i] = useMutation([packet[0], options[i]]);
        }
      });
      return null;
    }
  ];
};
