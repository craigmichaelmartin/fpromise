# `fPromise`

[![Build Status](https://travis-ci.org/craigmichaelmartin/fpromise.svg?branch=master)](https://travis-ci.org/craigmichaelmartin/fpromise)
[![Greenkeeper badge](https://badges.greenkeeper.io/craigmichaelmartin/fpromise.svg)](https://greenkeeper.io/)
[![codecov](https://codecov.io/gh/craigmichaelmartin/fpromise/branch/master/graph/badge.svg)](https://codecov.io/gh/craigmichaelmartin/fpromise)

## Installation

```bash
npm install --save fpromise
```

## What is `fPromise`?

`fPromise` is a javascript library for working with promises.

It seeks to resolve [three problems with promises](https://dev.to/thecraigmichael/the-problem-with-promises-in-javascript-5h46):
- Promises have an API which encourages casually dangerous code
- Promises co-mingle rejected promises with unintended native exceptions
- Promises lack a suite of convenient API methods to work with results

(For background, and probably a better explanation about this library, read
[that article about the problems with promises](https://dev.to/thecraigmichael/the-problem-with-promises-in-javascript-5h46)).

`fPromise` solves these issues by adding a layer of abstraction within promises - re-designing promises's two path design (resolved/rejected) into three paths:
a data path, a non-native exception path (ie, for promises rejected by your
own intentions), and a native exception path.

With these three paths, we can have an API which is safe, intentional,
 convenient, and more readable.

Importantly this abstraction:
- [x] using promises
- [x] leave the promise prototype untouched
- [x] provide a safe API for using them which isn't casually dangerous
- [x] ensures unintentional runtime errors are not handled
- [x] provides utility methods for working with the data
- [x] increases readability (vs try blocks)
- [x] keeps control in main call block (so returns work)

`fPromise` works by ensuring only native exceptions are ever in the "rejected" lane,
and uses a special wrapper object for the "fulfilled" lane: one which has
convenient methods available on it, and which unboxes to [data, error].

This mean we never have to try/catch with await (a pattern which is less
readable and can encourage casually dangerous code) - and that unintentional
errors are then are uncaught (like how syncrounous code works).

Instead of using try/catch, we destructure the special object to receive
either the data or the non-native issue which occurred.

## Usage

### Regular Style

Pass a promise to the `fp` function.

```javascript
  const { fp } = require('fpromise');
  const [data, issue] = await fp(Promise.resolve('foo')); // data === foo
  const [data, issue] = await fp(Promise.reject('bar')); // issue === bar
  const [data, issue] = await fp(Promise.resolve().then(x => undefined())); // throws! good!
```

If you want to work with the data, await the promise (so it resolves to the
Either, and then use those methods).

```javascript
  const { fp } = require('fpromise');
  const [data, issue] = (await fp(Promise.resolve('foo'))
    .tap(console.log)
    .map(d => d.toUpperCase())
  // prints foo, data === FOO
```

### Functional Style

```javascript
  const { map, tap } = require('fpromise');
  const [data, issue] = await Promise.resolve('foo'))
    .then(...tap(console.log))
    .then(...map(d => d.toUpperCase()))
  // prints foo, data === FOO
```


## Example

```javascript
// data-access/user.js
const save = user => fp(db.execute(user.getInsertSQL()))

// service/user.js
const save = async data =>
  (await save(User(data)))
    .tap(getStandardLog('user_creation'))
    .map(User.parseUserFromDB)
    .itap(logError)

// controllers/user.js
const postHandler = async (userDate, response) => {
  const [user, error] = await save(userData);
  if (error) {
    const errorToCode = { 'IntegrityError': 422 }; 
    return response.send(errorToCode[error.constructor.name] || 400);
  }
  response.send(204);
  postEmailToMailChimp(user.email).tapError(logError);
}
```

If we wanted to use the more functional approach, no need for initially wrapping the promise:


```javascript
// data-access/user.js
const save = user => db.execute(user.getInsertSQL();

// service/user.js
const save = data => save(data)
  .then(...tap(getStandardLog('user_creation')))
  .then(...map(User.parseUserFromDB))
  .then(...itap(logError))

// controllers/user.js
const postHandler = async (userDate, response) => {
  const [user, error] = await save(userData);
  // ...
}
```

If we want to move even further in the functional direction, we could:


```javascript
// data-access/user.js
const save = user => db.execute(user.getInsertSQL();

// service/user.js
const save = data => save(data)
  .then(...tap(getStandardLog('user_creation')))
  .then(...map(User.parseUserFromDB))
  .then(...itap(logError))

// controllers/user.js
const postHandler = (userDate, response) =>
  save(userData).then(...map(
    user => //...
    error => //...
  );
```


## API

| function | explanation / example |
| -------- | ----------------------|
| `fp`     | Accepts a promise and return a promise which rejects for native errors or resolves to an Either <br/> `const [data, issue] = await fp(Promise.resolve('foo')); // data == 'foo'`

**`Data`**

| utility methods | explanation / example |
| ------ | ----------------------|
| `map` | Accepts a transforming fn and returns a Data with the newly transformed value <br/> `const [data, issue] = Data('foo').map(x => x.toUpperCase()) // data === FOO`
| `imap` (issue map) | Accepts a transforming fn, but is a no-op - method targets Issue <br/> `const [data, issue] = Data('foo').imap(x => x.toUpperCase()) // data === foo`
| `bmap` (both map) | Accepts two transforming fns, and returns a Data with the value of the first fn's transform <br/>`const [data, issue] = Data('foo').bmap(x => x.toUpperCase(), y => y.length) // data === FOO`
| `raw` | Accepts a transforming fn and returns its value (without reboxing in Data) <br/> `const val = Data('foo').raw(x => x.toUpperCase()) // val === FOO`
| `iraw` (issue raw) | Accepts a fn, but is a no-op - method targets Issue <br/> `const val = Data('foo').iraw(x=> x.toUpperCase()) // val === foo`
| `braw` (both raw) | Accepts two transforming fns, and returns the value of the first fn's transform (without reboxing) <br/> `const val = Data('foo').braw(x => x.toUpperCase(), y => y.length) // val === FOO`
| `tap` | Accepts a side effect fn and runs it on the data (fn's return is not used) <br/> `const [data, issue] = Data('foo').tap(console.log) // foo is printed; data === 'foo'`
| `itap` (issue tap) | Accepts a side effect fn but is a no-op - method targets Issue <br/> `const [data, issue] = Data('foo').itap(console.log) // nothing printed, data === 'foo'`
| `btap` (both tap) | Accepts two side effect fns, and runs the first fn (fn's return is not used) <br/> `const [data, issue] = Data('foo').btap(console.log, console.warn) // foo is printed; data === 'foo'`
| `val` | Returns data as first element in array <br/> `const [data, issue] = Data('foo').val() // data === foo`
| `isData` | Returns true <br/> `Data('foo').isData // true`
| `isIssue` | Returns false <br/> `Data('foo').isIssue // false`
| `[Symbol.iterator]` | Yields data and nothing else. This is the reason we can "unbox" Data with array destructing <br/> `const [data, issue] = Data('foo') // data === 'foo'`

**`Issue`**

| utility methods | explanation / example |
| ------ | ----------------------|
| `map` | Accepts a transforming fn, but is a no-op - method targets Data <br/> `const [data, issue] = Issue('bar').imap(x => x.toUpperCase()) // issue === bar`
| `imap` (issue map) | Accepts a transforming fn and returns an Issue with the newly transformed value <br/> `const [data, issue] = Issue('bar').imap(x => x.toUpperCase()) // issue === BAR`
| `bmap` (both map) | Accepts two transforming fns, and returns a Issue with the value of the second fn's transform <br/>`const [data, issue] = Issue('bar').bmap(x => x.length(), y => y.toUpperCase) // issue === BAR`
| `raw` | Accepts a fn, but is a no-op - method targets Issue <br/> `const val = Issue('bar').raw(x=> x.toUpperCase()) // val === bar`
| `iraw` (issue raw) | Accepts a transforming fn and returns its value (without reboxing in Issue) <br/> `const val = Issue('bar').iraw(x => x.toUpperCase()) // val === BAR`
| `braw` (both raw) | Accepts two transforming fns, and returns the value of the second fn's transform (without reboxing) <br/> `const val = Issue('bar').braw(x => x.length(), y => y.toUpperCase()) // val === BAR`
| `tap` | Accepts a side effect fn but is a no-op - method targets Issue <br/> `const [data, issue] = Issue('bar').itap(console.log) // nothing printed, issue === 'bar'`
| `itap` (issue tap) | Accepts a side effect fn and runs it on the issue (fn's return is not used) <br/> `const [data, issue] = Issue('bar').itap(console.log) // bar is printed; issue === 'bar'`
| `btap` (both tap) | Accepts two side effect fns, and runs the second fn (fn's return is not used) <br/> `const [data, issue] = Issue('bar').btap(console.warn, console.log) // bar is printed; issue === 'bar'`
| `val` | Returns issue as the second element in array <br/> `const [data, issue] = Issue('bar').val() // issue === bar`
| `isData` | Returns false <br/> `Data('bar').isData // false`
| `isIssue` | Returns true <br/> `Data('bar').isIssue // true`
| `[Symbol.iterator]` | Yields undefined and then data. This is the reason we can "unbox" Issue with array destructing <br/> `const [data, issue] = Issue('bar') // issue === 'bar'`

**Funtional**

You would use these if you don't use `fp` to wrap the promise.

| functions |
| -------- |
| `map` | `const [d, i] = await Promise.resolve('foo').then(...map(x => x.toUpperCase())) // d = FOO` <br/> `const [d, i] = await Promise.reject('bar').then(...map(x => x.toUpperCase())) // i = bar`
| `imap` (issue map) | `const [d, i] = await Promise.resolve('foo').then(...imap(x => x.toUpperCase())) // d = foo` <br/> const [d, i] = await Promise.reject('bar').then(...imap(x => x.toUpperCase())) // BAR`
| `bmap` (both map) | `const [d, i] = await Promise.resolve('foo').then(...bmap(x => x.toUpperCase(), y => y.length)) // d = FOO` <br/> `const [d, i] = await Promise.reject('bar').then(...bmap(x => x.length, y => y.toUpperCase())) // BAR`
| `raw` | `await Promise.resolve('foo').then(...raw(x => x.toUpperCase())) // FOO` <br/> `await Promise.reject('bar').then(...raw(x => x.toUpperCase())) // bar`
| `iraw` (issue raw) | `await Promise.resolve('foo').then(...iraw(x => x.toUpperCase())) // foo` <br/> `await Promise.reject('bar').then(...iraw(x => x.toUpperCase())) // BAR`
| `braw` (both raw) | `await Promise.resolve('foo').then(...braw(x => x.toUpperCase(), y => y.length)) // d = FOO` <br/> `await Promise.reject('bar').then(...braw(x => x.length, y => y.toUpperCase())) // BAR`
| `tap` | `const [d, i] = await Promise.resolve('foo').then(...tap(console.log)) // prints foo, d = foo` <br/> `const [d, i] = await Promise.reject('bar').then(...tap(console.log)) // i = bar`
| `itap` (issue tap) | `const [d, i] = await Promise.resolve('foo').then(...itap(console.log)) // d = foo` <br/> `const [d, i] = await Promise.reject('bar').then(console.log) // prints bar, i = bar`
| `btap` (both tap) | `const [d, i] = await Promise.resolve('foo').then(...btap(console.log, console.warn)) // prints foo, d = foo` <br/> `const [d, i] = await Promise.reject('bar').then(...btap(console.warn, console.log)) // print bar, i = barr`


## Woah, this is apparently a thing and so here are Links About This Stuff From Smart People:
- https://medium.com/@gunar/async-control-flow-without-exceptions-nor-monads-b19af2acc553
- https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/
- http://jessewarden.com/2017/11/easier-error-handling-using-asyncawait.html
- https://medium.freecodecamp.org/avoiding-the-async-await-hell-c77a0fb71c4c
- https://medium.com/@dominic.mayers/async-await-without-promises-725e15e1b639
- https://medium.com/@dominic.mayers/on-one-hand-the-async-await-framework-avoid-the-use-of-callbacks-to-define-the-main-flow-in-812317d19285
- https://dev.to/sadarshannaiynar/capture-error-and-data-in-async-await-without-try-catch-1no2
- https://medium.com/@pyrolistical/the-hard-error-handling-case-made-easy-with-async-await-597fd4b908b1
- https://gist.github.com/woudsma/fe8598b1f41453208f0661f90ecdb98b

## Actually Good Projects

- https://gist.github.com/DavidWells/56089265ab613a1f29eabca9fc68a3c6
- https://github.com/gunar/go-for-it
- https://github.com/majgis/catchify
- https://github.com/scopsy/await-to-js
- https://github.com/fluture-js/Fluture
- https://github.com/russellmcc/fantasydo

# Current Status

**Known TODOs**
- Actually make the readme good/helpful/clear.
- Decide about aliases:
  | Data | Issue | Both |
  |------|-------|------|
  | map (dmap) | imap | bmap (map with two functions) |
  | raw (draw) | iraw | braw (raw with two functions) |
  | tap (dtap) | itap | btap (tap with two functions) |

**Is it production ready?**
This library is a version two of [library](https://github.com/craigmichaelmartin/uter) extracted out of code in production at www.kujo.com. Kujo is still on that version 1, though, for now.
