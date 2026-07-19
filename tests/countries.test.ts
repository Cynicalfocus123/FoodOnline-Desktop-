import assert from "node:assert/strict";
import test from "node:test";
import { countries, countryNameFromCode } from "../src/data/countries.ts";

test("brand country selector contains the complete unique ISO alpha-2 list", () => {
  assert.equal(countries.length, 249);
  assert.equal(new Set(countries.map((country) => country.code)).size, 249);
  assert.equal(new Set(countries.map((country) => country.name)).size, 249);
  assert.ok(countries.every((country) => /^[A-Z]{2}$/.test(country.code)));
  assert.ok(countries.every((country) => country.name && country.name !== country.code));
  assert.deepEqual(
    countries.map((country) => country.name),
    [...countries].sort((a, b) => a.name.localeCompare(b.name, "en")).map((country) => country.name),
  );
});

test("requested Asian and Middle Eastern countries resolve from existing codes", () => {
  const expected = {
    TH: "Thailand", CN: "China", JP: "Japan", KR: "South Korea", KP: "North Korea", TW: "Taiwan",
    HK: "Hong Kong", MO: "Macau", SG: "Singapore", MY: "Malaysia", ID: "Indonesia", VN: "Vietnam",
    PH: "Philippines", MM: "Myanmar", LA: "Laos", KH: "Cambodia", BN: "Brunei", TL: "Timor-Leste",
    IN: "India", PK: "Pakistan", BD: "Bangladesh", LK: "Sri Lanka", NP: "Nepal", BT: "Bhutan",
    MV: "Maldives", MN: "Mongolia", KZ: "Kazakhstan", UZ: "Uzbekistan", TM: "Turkmenistan",
    KG: "Kyrgyzstan", TJ: "Tajikistan", AF: "Afghanistan", IR: "Iran", IQ: "Iraq",
    SA: "Saudi Arabia", AE: "United Arab Emirates", QA: "Qatar", KW: "Kuwait", BH: "Bahrain",
    OM: "Oman", YE: "Yemen", JO: "Jordan", LB: "Lebanon", SY: "Syria", IL: "Israel",
    PS: "Palestine", TR: "Turkey", AM: "Armenia", AZ: "Azerbaijan", GE: "Georgia",
  } as const;

  for (const [code, name] of Object.entries(expected)) assert.equal(countryNameFromCode(code), name);
  assert.equal(countryNameFromCode("jp"), "Japan");
  assert.equal(countryNameFromCode(null), "");
});
