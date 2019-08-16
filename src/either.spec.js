const { fp, Data, Issue, map, imap, bmap, raw, iraw, braw, tap, itap, btap, nativeExceptions } = require('./either');

const resolved = Promise.resolve('foo');
const rejected = Promise.reject('bar');

// ----------------------------------------------------------------------------
// fp -------------------------------------------------------------------------
// ----------------------------------------------------------------------------

test('fp - result of a successful promise is boxed into a Data', async () => {
  expect.assertions(1);
  const either = await fp(resolved);
  expect(either.isData).toBe(true);
});

test('fp - result of a non-native issue is boxed into a Issue', async () => {
  expect.assertions(1);
  const either = await fp(rejected);
  expect(either.isIssue).toBe(true);
});

test('fp - result of a native issue is not handled and throws', async () => {
  expect.assertions(nativeExceptions.length);
  nativeExceptions.forEach(async NativeException => {
    try {
      await fp(resolved.then(_ => {
        throw new NativeException('qux');
      }));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('fp - throws', async () => {
  expect.assertions(1);
  const either = await fp(rejected);
  expect(either.isIssue).toBe(true);
});

// ----------------------------------------------------------------------------
// Data -----------------------------------------------------------------------
// ----------------------------------------------------------------------------

test('Data - has all methods/properties', () => {
  const either = Data('foo');
  expect(either.map).not.toBeUndefined();
  expect(either.imap).not.toBeUndefined();
  expect(either.map).not.toBeUndefined();
  expect(either.raw).not.toBeUndefined();
  expect(either.iraw).not.toBeUndefined();
  expect(either.braw).not.toBeUndefined();
  expect(either.tap).not.toBeUndefined();
  expect(either.itap).not.toBeUndefined();
  expect(either.btap).not.toBeUndefined();
  expect(either.val).not.toBeUndefined();
  expect(either.isData).not.toBeUndefined();
});

test('Data - unboxes (via iterable)', () => {
  const [data, issue] = Data('foo');
  expect(data).toEqual('foo');
  expect(issue).toBeUndefined();
});

test('Data - val (unboxes into array)', () => {
  const [data, issue] = Data('foo').val();
  expect(data).toEqual('foo');
  expect(issue).toBeUndefined();
});

test('Data - map', () => {
  const [data] = Data('foo').map(x => x.toUpperCase());
  expect(data).toEqual('FOO');
});

test('Data - imap', () => {
  const [data] = Data('foo').imap(() => {
    throw new Error('this code should not be run');
  });
  expect(data).toEqual('foo');
});

test('Data - bmap', () => {
  const [data] = Data('foo').bmap(
    d => d.toUpperCase(),
    () => { throw new Error('this code should not be run'); }
  );
  expect(data).toEqual('FOO');
});

test('Data - raw', () => {
  const data = Data('foo').raw(x => x.toUpperCase());
  expect(data).toEqual('FOO');
});

test('Data - iraw', () => {
  // Not unboxed because iraw is a no-op
  const [data] = Data('foo').iraw(() => {
    throw new Error('this code should not be run');
  });
  expect(data).toEqual('foo');
});

test('Data - braw', () => {
  const data = Data('foo').braw(
    d => d.toUpperCase(),
    () => { throw new Error('this code should not be run'); }
  );
  expect(data).toEqual('FOO');
});

test('Data - tap', () => {
  // Even if a value is returned, tap is purely for side effects so not used
  let flag = false;
  const [data] = Data('foo').tap(d => {
    flag = true;
    return d.toUpperCase();
  });
  expect(flag).toBe(true);
  expect(data).toEqual('foo');
});

test('Data - itap', () => {
  // Warn is a no-op on Data
  const [data] = Data('foo').itap(() => {
    throw new Error('this code should not be run');
  });
  expect(data).toEqual('foo');
});

test('Data - btap', () => {
  let flag = false;
  const [data] = Data('foo').btap(
    d => {
      flag = true;
      return d.toUpperCase();
    },
    () => { throw new Error('this code should not be run'); }
  );
  expect(flag).toBe(true);
  expect(data).toEqual('foo');
});

// ----------------------------------------------------------------------------
// Issue ----------------------------------------------------------------------
// ----------------------------------------------------------------------------

test('Issue - has all methods/properties', () => {
  const either = Issue('bar');
  expect(either.map).not.toBeUndefined();
  expect(either.imap).not.toBeUndefined();
  expect(either.map).not.toBeUndefined();
  expect(either.raw).not.toBeUndefined();
  expect(either.iraw).not.toBeUndefined();
  expect(either.braw).not.toBeUndefined();
  expect(either.tap).not.toBeUndefined();
  expect(either.itap).not.toBeUndefined();
  expect(either.btap).not.toBeUndefined();
  expect(either.val).not.toBeUndefined();
  expect(either.isData).not.toBeUndefined();
});

test('Issue - unboxes (via iterable)', () => {
  const [data, issue] = Issue('bar');
  expect(data).toBeUndefined();
  expect(issue).toEqual('bar');
});

test('Issue - val (unboxes into array)', () => {
  const [data, issue] = Issue('bar').val();
  expect(data).toBeUndefined();
  expect(issue).toEqual('bar');
});

test('Issue - map', () => {
  const [, issue] = Issue('bar').map(() => {
    throw new Error('this code should not be run');
  });
  expect(issue).toEqual('bar');
});

test('Issue - imap', () => {
  const [, issue] = Issue('bar').imap(x => x.toUpperCase());
  expect(issue).toEqual('BAR');
});

test('Issue - bmap', () => {
  const [, issue] = Issue('bar').bmap(
    () => { throw new Error('this code should not be run'); },
    i => i.toUpperCase(),
  );
  expect(issue).toEqual('BAR');
});

test('Issue - raw', () => {
  // Not unboxed because iraw is a no-op
  const [, issue] = Issue('bar').raw(() => {
    throw new Error('this code should not be run');
  });
  expect(issue).toEqual('bar');
});

test('Issue - iraw', () => {
  const issue = Issue('bar').iraw(x => x.toUpperCase());
  expect(issue).toEqual('BAR');
});

test('Issue - braw', () => {
  const issue = Issue('bar').braw(
    () => { throw new Error('this code should not be run'); },
    i => i.toUpperCase(),
  );
  expect(issue).toEqual('BAR');
});

test('Issue - tap', () => {
  // Warn is a no-op on Issue
  const [, issue] = Issue('bar').tap(() => {
    throw new Error('this code should not be run');
  });
  expect(issue).toEqual('bar');
});

test('Issue - itap', () => {
  // Even if a value is returned, tap is purely for side effects so not used
  let flag = false;
  const [, issue] = Issue('bar').itap(d => {
    flag = true;
    return d.toUpperCase();
  });
  expect(flag).toBe(true);
  expect(issue).toEqual('bar');
});

test('Issue - btap', () => {
  let flag = false;
  const [, issue] = Issue('bar').btap(
    () => { throw new Error('this code should not be run'); },
    i => {
      flag = true;
      return i.toUpperCase();
    },
  );
  expect(flag).toBe(true);
  expect(issue).toEqual('bar');
});

// ----------------------------------------------------------------------------
// functional -----------------------------------------------------------------
// ----------------------------------------------------------------------------

test('map', async () => {
  expect.assertions(2 + nativeExceptions.length);
  // resolved promises
  const [data] = await resolved.then(...map(x => x.toUpperCase()));
  expect(data).toEqual('FOO');
  // non-native rejected promise
  const [, issue] = await rejected.then(...map(x => x.toUpperCase()));
  expect(issue).toEqual('bar');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...map(x => x.toUpperCase()));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('imap', async () => {
  expect.assertions(2 + nativeExceptions.length);
  // resolved promises
  const [data] = await resolved.then(...imap(x => x.toUpperCase()));
  expect(data).toEqual('foo');
  // non-native rejected promise
  const [, issue] = await rejected.then(...imap(x => x.toUpperCase()));
  expect(issue).toEqual('BAR');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...imap(x => x.toUpperCase()));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('bmap', async () => {
  expect.assertions(2 + nativeExceptions.length);
  // resolved promises
  const [data] = await resolved.then(...bmap(
    d => d.toUpperCase(),
    () => { throw new Error('this code should not be run'); }
  ));
  expect(data).toEqual('FOO');
  // non-native rejected promise
  const [, issue] = await rejected.then(...bmap(
    () => { throw new Error('this code should not be run'); },
    i => i.toUpperCase()
  ));
  expect(issue).toEqual('BAR');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...bmap(
        d => d.toUpperCase(),
        i => i.toUpperCase()
      ));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('raw', async () => {
  expect.assertions(2 + nativeExceptions.length);
  // resolved promises
  const data = await resolved.then(...raw(x => x.toUpperCase()));
  expect(data).toEqual('FOO');
  // non-native rejected promise
  const [, issue] = await rejected.then(...raw(x => x.toUpperCase()));
  expect(issue).toEqual('bar');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...raw(x => x.toUpperCase()));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('iraw', async () => {
  expect.assertions(2 + nativeExceptions.length);
  // resolved promises
  const [data] = await resolved.then(...iraw(x => x.toUpperCase()));
  expect(data).toEqual('foo');
  // non-native rejected promise
  const issue = await rejected.then(...iraw(x => x.toUpperCase()));
  expect(issue).toEqual('BAR');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...iraw(x => x.toUpperCase()));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('braw', async () => {
  expect.assertions(2 + nativeExceptions.length);
  // resolved promises
  const data = await resolved.then(...braw(
    d => d.toUpperCase(),
    () => { throw new Error('this code should not be run'); }
  ));
  expect(data).toEqual('FOO');
  // non-native rejected promise
  const issue = await rejected.then(...braw(
    () => { throw new Error('this code should not be run'); },
    i => i.toUpperCase()
  ));
  expect(issue).toEqual('BAR');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...braw(
        d => d.toUpperCase(),
        i => i.toUpperCase()
      ));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});


test('tap', async () => {
  expect.assertions(3 + nativeExceptions.length);
  // resolved promises
  let flag = false;
  const [data] = await resolved.then(...tap(x => {
    flag = true;
    return x.toUpperCase();
  }));
  expect(data).toEqual('foo');
  expect(flag).toBe(true);
  // non-native rejected promise
  const [, issue] = await rejected.then(...tap(() => {
    throw new Error('this code should not be run');
  }));
  expect(issue).toEqual('bar');
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...tap(() => {
        throw new Error('this code should not be run');
      }));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('itap', async () => {
  expect.assertions(3 + nativeExceptions.length);
  // resolved promises
  const [data] = await resolved.then(...itap(() => {
    throw new Error('this code should not be run');
  }));
  expect(data).toEqual('foo');
  // non-native rejected promise
  let flag = false;
  const [, issue] = await rejected.then(...itap(x => {
    flag = true;
    return x.toUpperCase();
  }));
  expect(issue).toEqual('bar');
  expect(flag).toBe(true);
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...itap(() => {
        throw new Error('this code should not be run');
      }));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});

test('btap', async () => {
  expect.assertions(4 + nativeExceptions.length);
  // resolved promises
  let flag1 = false;
  const [data] = await resolved.then(...btap(
    d => { flag1 = true; return d.toUpperCase(); },
    () => { throw new Error('this code should not be run'); }
  ));
  expect(data).toEqual('foo');
  expect(flag1).toBe(true);
  // non-native rejected promise
  let flag2 = false;
  const [, issue] = await rejected.then(...btap(
    () => { throw new Error('this code should not be run'); },
    i => { flag2 = true; return i.toUpperCase(); }
  ));
  expect(issue).toEqual('bar');
  expect(flag2).toBe(true);
  // native error
  nativeExceptions.forEach(async NativeException => {
    const failsWithNativeException = resolved.then(() => {
      throw new NativeException('qux');
    });
    try {
      await failsWithNativeException.then(...btap(
        () => { throw new Error('this code should not be run'); },
        () => { throw new Error('this code should not be run'); }
      ));
    } catch (err) {
      expect(err instanceof NativeException).toBe(true);
    }
  });
});
