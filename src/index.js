
/*
Co-mingles strategic exceptions and unintented.
*/



// fPromise solution
handleSave(rawUserData) {
  const [err, {user}] = saveUser(rawUserData);
  if (err) {
    createToast(`User could not be saved`);
  } else {
    createToast(`User ${user.name} has been created`),
  }
}

///////////////////////////////////////////////////////////////////////////////

// Tendency to catch too much stuff
// The above issue is an example of this (catching the http error and then
// erros ambiguosly) but it manifests again when the user thinks they are
// catching only the most recent error.


// Generic solution
handleSave(rawUserData) {
  marshallData(rawUserData)
    .then(saveUser)
    .then(parseData)
    .then(user =>
      highlightUserDivById(user.id)
        .catch(err => {} /* user div must no longer be on screen which is fine, so do nothing */)
    )
}

// Async / Await solution
// The issue of catching more than we should be is clearer in this syntax.


///////////////////////////////////////////////////////////////////////////////

// Unintentionally recovering from an expection



///////////////////////////////////////////////////////////////////////////////

// Losing the stack of the local function (to return if desired)







///////////////////////////////////////////////////////////////////////////////
/*
Chaining is ambiguous?
Two functions in a function param is not pretty?
*/
