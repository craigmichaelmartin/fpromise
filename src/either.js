/* eslint no-unused-vars: 0 */
/* eslint no-multi-spaces: 0 */
/* eslint no-sparse-arrays: 0 */

/*
 Data         Issue           Both
 --------------------------------------------
 map          imap            bmap
 raw          iraw            braw
 tap          itap            btap
*/

const Data = x => ({
  map: f => Data(f(x)),             // transform the data by applying the fn
  imap: f => Data(x),               // no-op (method targets Issue)
  bmap: (f, g) => Data(f(x)),       // run respective fn on data
  raw: f => f(x),                   // transform the data without reboxing
  iraw: f => Data(x),               // no-op (method targets Issue)
  braw: (f, g) => f(x),             // run respective fn on data without reboxing
  tap: f => (f(x), Data(x)),        // runs side effect fn on data
  itap: f => Data(x),               // no-op (method targets Issue)
  btap: (f, g) => (f(x), Data(x)),  // run respective side effect fn on data
  val: () => [x],
  isData: true,
  isIssue: false,
  [Symbol.iterator]: function *() { yield x; }
});

const Issue = x => ({
  map: f => Issue(x),               // no-op (method targets Data)
  imap: f => Issue(f(x)),           // transform the issue by applyin the fn
  bmap: (f, g) => Issue(g(x)),      // run respective fn on issue
  raw: f => Issue(x),               // no-op (method targets Data)
  iraw: f => f(x),                  // transform the issue without reboxing
  braw: (f, g) => g(x),             // run respective fn on issue without reboxing
  tap: f => Issue(x),               // no-op (method target Data)
  itap: f => (f(x), Issue(x)),      // runs side effect fn on issue
  btap: (f, g) => (g(x), Issue(x)), // run respective side effect fn on issue
  val: () => [, x],
  isData: false,
  isIssue: true,
  [Symbol.iterator]: function *() { yield void 0; yield x; }
});

const ensureData = data =>
  data instanceof Data ? data : Data(data);

const nativeExceptions = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError
];

const ensureIssue = issue => {
  if (nativeExceptions.find(e => issue instanceof e)) {
    throw issue;
  }
  return issue instanceof Issue ? issue : Issue(issue);
};

const fp = promise => promise.then(ensureData, ensureIssue);

const map = f =>
  [o => ensureData(o).map(f), o => ensureIssue(o).map(f)];
const imap = f =>
  [o => ensureData(o).imap(f), o => ensureIssue(o).imap(f)];
const bmap = (f, g) =>
  [o => ensureData(o).bmap(f, g), o => ensureIssue(o).bmap(f, g)];
const raw = f =>
  [o => ensureData(o).raw(f), o => ensureIssue(o).raw(f)];
const iraw = f =>
  [o => ensureData(o).iraw(f), o => ensureIssue(o).iraw(f)];
const braw = (f, g) =>
  [o => ensureData(o).braw(f, g), o => ensureIssue(o).braw(f, g)];
const tap = f =>
  [o => ensureData(o).tap(f), o => ensureIssue(o).tap(f)];
const itap = f =>
  [o => ensureData(o).itap(f), o => ensureIssue(o).itap(f)];
const btap = (f, g) =>
  [o => ensureData(o).btap(f, g), o => ensureIssue(o).btap(f, g)];

module.exports = {
  Data,
  Issue,
  fp,
  map,
  imap,
  bmap,
  raw,
  iraw,
  braw,
  tap,
  itap,
  btap,
  nativeExceptions
};
