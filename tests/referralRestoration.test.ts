import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const account = readFileSync("src/components/AccountPage.tsx", "utf8");
const adminPanel = readFileSync("src/components/admin/ReferralAdminPanel.tsx", "utf8");
const adminApi = readFileSync("src/services/admin/referralsApi.ts", "utf8");
const accountReferral = account.slice(account.indexOf("function ReferralPanel({ accountType"), account.indexOf("function ReferralCouponsPanel"));

test("Customer Refer & Earn keeps a data-driven invitation dashboard and independent activity state", () => {
  assert.match(accountReferral, /apiRequest<ReferralDashboard>\("\/account\/referrals", \{ token \}\)/);
  assert.match(accountReferral, /\/account\/referrals\/activity\?page=\$\{page\}&per_page=10/);
  assert.match(accountReferral, /Your invite code/);
  assert.match(accountReferral, /Your invite link/);
  assert.match(accountReferral, /No referral activity yet\./);
  assert.match(accountReferral, /How it works/);
  assert.match(accountReferral, /accountType !== "customer"/);
  assert.match(accountReferral, /ReferralRetry/);
  assert.doesNotMatch(account, /Referral details are unavailable right now\./);
});

test("Customer referral share actions are exactly Share, Copy link, and Copy invite code", () => {
  const labels = [...accountReferral.matchAll(/type="button">(Share|Copy link|Copy invite code)<\/button>/g)].map((match) => match[1]);
  assert.deepEqual(labels, ["Share", "Copy link", "Copy invite code"]);
  assert.match(accountReferral, /navigator\.share/);
  assert.match(accountReferral, /navigator\.clipboard\.writeText/);
});

test("Admin referral operations preserve headings while supporting safe empty, retry, filter, and pagination states", () => {
  for (const heading of ["Referrer", "Friend", "Code", "Status", "Registered"]) assert.match(adminPanel, new RegExp(`>${heading}<`));
  assert.match(adminPanel, /No referrals found\./);
  assert.match(adminPanel, /No referrals match the selected filters\./);
  assert.match(adminPanel, /Retry/);
  assert.match(adminPanel, /Search referrer or friend/);
  assert.match(adminPanel, /Previous/);
  assert.match(adminPanel, /Next/);
  assert.doesNotMatch(adminPanel, /Unable to load referrals\./);
});

test("Admin referral client sends server-owned filters and pagination rather than mock rows", () => {
  assert.match(adminApi, /URLSearchParams/);
  assert.match(adminApi, /query\.set\("search"/);
  assert.match(adminApi, /query\.set\("status"/);
  assert.match(adminApi, /query\.set\("review_status"/);
  assert.match(adminApi, /meta: ReferralListMeta/);
});
