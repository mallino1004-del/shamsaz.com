import test from "node:test";
import assert from "node:assert/strict";
import { persianDateToISO, persianDateParts } from "../shared/calendar.ts";
test("Persian birth dates preserve real leap days and reject invalid calendar dates", () => {
  assert.equal(persianDateToISO(1403, 12, 30), "2025-03-20");
  assert.equal(persianDateToISO(1402, 12, 30), null);
  assert.equal(persianDateToISO(1403, 7, 31), null);
  assert.equal(persianDateParts("2026-02-31"), null);
  assert.deepEqual(persianDateParts("2025-03-20"), {
    year: 1403,
    month: 12,
    day: 30,
  });
  assert.equal(persianDateToISO(1370, 1, 15), "1991-04-04");
});
