# log-and-return README

Converts your javascript function return statements into a statement that will first log, then return the value. Useful for debugging!

## Features

Turns

```js
function myFunc() {
  let x = 2 + 2;
  return x;
}
```

into

```js
function myFunc() {
  let x = 2 + 2;
  return (a => console.log(a) || a)(x);
}
```

You can make this happen by simply running the command with your cursor anywhere on the return statement line, or by selecting the return statement. In order to work with multi-line return statements, you must select the whole statement.

### 1.0.0

Initial release of log-and-return.
