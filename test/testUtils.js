export const getPropsFor = (obj, target) =>
  obj
    .children()
    .find(target)
    .props();

export const verifyPropsFor = (obj, target, expected) => {
  let props = getPropsFor(obj, target);
  expect(props).toEqual(expected);
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

export const resolveDeferred = async (p, val, obj) => {
  p.resolve(val);
  await p;
  obj.update();
};

export const rejectDeferred = async (p, val, obj) => {
  p.reject(val);
  try {
    await p;
  } catch (er) {}
  obj.update();
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

export const pause = obj =>
  new Promise(res =>
    setTimeout(() => {
      obj.update();
      res();
    }, 10)
  );
