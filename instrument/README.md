This is the instrumentation library that instruments client code to send code usage to the platform.

We are only looking to instrument Typescript code. We want to capture usage information for all functions (and class methods) that are called.

We only care about whether the function is used or not. We don't care about the arguments or the return value. So for each function use we will want to capture the following information:

- The function name
- The file name
- The line number
- The number of calls since the last capture

It needs to be super easy to use in a client application and should not affect performance significantly. It should hook into the JS runtime and be able to capture usage information for all functions that are called (it might upload the latest information every 10 seconds or so).
