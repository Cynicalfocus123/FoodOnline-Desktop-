import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const account = readFileSync("src/components/AccountPage.tsx", "utf8");
const signup = readFileSync("src/components/SignupFlow.tsx", "utf8");
const apiClient = readFileSync("src/lib/apiClient.ts", "utf8");
const adminPanel = readFileSync("src/components/admin/ReferralAdminPanel.tsx", "utf8");
const adminApi = readFileSync("src/services/admin/referralsApi.ts", "utf8");
const accountReferral = account.slice(account.indexOf("function ReferralPanel({ accountType"), account.indexOf("function ReferralCouponsPanel"));

test("shared Refer & Earn keeps the same dashboard and three controls for Customer, Supplier, and Partner", () => {
  assert.match(accountReferral, /apiRequest<ReferralDashboard>\("\/account\/referrals", \{ token \}\)/);
  assert.match(accountReferral, /\/account\/referrals\/activity\?page=\$\{page\}&per_page=10/);
  assert.match(accountReferral, /Your invite code/);
  assert.match(accountReferral, /Your invite link/);
  assert.match(accountReferral, /friend_account_type/);
  assert.match(accountReferral, /Customer, Supplier, or Partner/);
  assert.doesNotMatch(accountReferral, /accountType !== "customer"/);
  assert.doesNotMatch(account, /Referral coupons are available for Customer accounts/);
  assert.match(accountReferral, /ReferralRetry/);
});

test("shared referral share actions remain exactly Share, Copy link, and Copy invite code", () => {
  const labels = [...accountReferral.matchAll(/type="button">(Share|Copy link|Copy invite code)<\/button>/g)].map((match) => match[1]);
  assert.deepEqual(labels, ["Share", "Copy link", "Copy invite code"]);
  assert.match(accountReferral, /navigator\.share/);
  assert.match(accountReferral, /navigator\.clipboard\.writeText/);
});

test("all registration roles render and send the optional referral code", () => {
  assert.match(signup, /\{selectedRole \? \(/);
  assert.match(apiClient, /\.\.\.\(referralCode\?\.trim\(\) \? \{ referral_code:/);
  assert.doesNotMatch(apiClient, /selectedRole === "customer" && referralCode/);
});

test("Admin referrals use real mixed-role filters, detail actions, and independently retryable detail sections", () => {
  for (const heading of ["Referrer", "Friend", "Code", "Status", "Qualification", "Reward", "Registered"]) assert.match(adminPanel, new RegExp(`"${heading}"`));
  assert.match(adminPanel, /Referrer account type/);
  assert.match(adminPanel, /Referred account type/);
  assert.match(adminPanel, /View details/);
  assert.match(adminPanel, /Qualification/);
  assert.match(adminPanel, /Rewards and coupons/);
  assert.match(adminPanel, /Referral notifications/);
  assert.match(adminPanel, /Audit history/);
  assert.match(adminPanel, /Mark for review/);
  assert.match(adminPanel, /window\.confirm/);
  assert.match(adminPanel, /OptionalSection/);
  assert.match(adminPanel, /No referrals found\./);
  assert.match(adminPanel, /No referrals match the selected filters\./);
  assert.match(adminPanel, /Retry/);
});

test("Admin referral client sends server-owned role filters and requests each real detail section", () => {
  assert.match(adminApi, /URLSearchParams/);
  assert.match(adminApi, /query\.set\("referrer_account_type"/);
  assert.match(adminApi, /query\.set\("referred_account_type"/);
  assert.match(adminApi, /\/qualification/);
  assert.match(adminApi, /\/rewards/);
  assert.match(adminApi, /\/audit-history/);
  assert.match(adminApi, /\/notifications/);
});
