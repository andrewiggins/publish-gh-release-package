import { test } from "uvu";
import { is } from "uvu/assert";
import { message } from "../dist/index.js";

test("correct export", async () => {
	is(message, "Hello World!");
});

test.run();
