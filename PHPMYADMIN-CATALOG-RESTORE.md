# FoodOnlines Catalog Restore in phpMyAdmin

This guide restores the original FoodOnlines catalog without deleting or replacing existing live catalog rows. The SQL file is designed for the current MySQL schema and inserts only missing records.

## Before you begin

- Use the file named `FoodOnlines_Restore_Original_Catalog.sql` from this same commit.
- Set aside enough uninterrupted time to finish the import and checks.
- Do not delete existing categories, products, brands, variants, or media first.
- Do not edit IDs, UUIDs, slugs, or SKUs in the SQL file.
- Never share your Hostinger, phpMyAdmin, or database password with anyone.

## Exact import steps

1. Log in to Hostinger hPanel.
2. Open **Websites**.
3. Select **foodonlines.com**.
4. Open **Databases**.
5. Open **phpMyAdmin**.
6. Select:
   `u517869682_FoodonlineDB`
7. Click **Export**.
8. Choose **Quick**.
9. Choose **SQL**.
10. Download the backup before doing anything else.
11. Return to the database.
12. Click **Import**.
13. Click **Choose File**.
14. Select:
    `FoodOnlines_Restore_Original_Catalog.sql`
15. Keep **SQL** format selected.
16. Click **Go**.
17. Wait for the green success message.
18. Do not refresh during import.
19. Check the `categories` table.
20. Check the `products` table.
21. Check the `product_variants` table.
22. Check the `brands` table.
23. Confirm `dried-food` still exists.
24. Reload:
    `https://foodonlines.com/admin/categories`
25. Reload:
    `https://foodonlines.com/admin/products`
26. Reload:
    `https://foodonlines.com`
27. Purge Cloudflare cache.
28. Hard refresh using **Ctrl + F5**.

## What success looks like

phpMyAdmin normally shows a green message similar to **Import has been successfully finished**. The SQL then displays result grids:

- `rows_inserted_this_run` — on the verified missing-catalog state, expect 16 categories, 1 alias, 9 brands, 240 products, 720 variants, 225 product-media rows, and 0 nutrition rows.
- `source_rows_resolved` — expect 16 categories, 9 brands, 240 products, 720 variants, and 225 media rows.
- `dried_food_preserved` — expect `before_count = 1`, `after_count = 1`, and `unchanged = 1`.
- `source_scope_integrity` — all duplicate and orphan counts should be `0`.

If some original rows already existed, the first result can show smaller inserted counts. That is normal when the resolved counts and integrity checks are correct. Running the same file a second time should show zero inserted rows.

## Check the restored data

In phpMyAdmin:

1. Open `categories`, sort or search by `slug`, and confirm the 16 original slugs listed in `CATALOG-RESTORE-VALIDATION.md` are active.
2. Search for `dried-food` and confirm its existing values were not changed.
3. Open `products` and confirm original product slugs such as `paan-corner-1`, `dairy-bread-eggs-1`, and `frozen-15` exist.
4. Open `product_variants` and confirm each restored product has Default, Family Size, and Bundle variants.
5. Confirm the default SKUs begin with `FO-` and prices are positive USD values.
6. Open `product_media`; products outside Paan Corner should have one safe `https://foodonlines.com/assets/...` primary image where the source asset exists.

## If phpMyAdmin reports a duplicate-key error

Stop and do not delete rows or edit IDs to force the import.

- If the message mentions `tmp_foodonlines_restore_guard.PRIMARY`, the safety guard found a conflicting UUID, SKU, alias, archived original category, or unresolved relationship. The transaction is intended not to commit. Save a screenshot of the complete error and have the collision reviewed before retrying.
- If the message names a live unique key such as a category slug, product slug, UUID, or SKU, stop. Do not use `INSERT IGNORE`, do not remove the unique key, and do not manually delete the existing record.
- Check whether phpMyAdmin shows that the transaction rolled back. If the state is uncertain, compare the database with the backup and use the restoration instructions below before another attempt.

The file is idempotent for a clean first import and immediate second import. A duplicate-key error is not an instruction to remove live data.

## If the import size is too large

The current SQL file is only about 253 KB, so normal phpMyAdmin limits should accept it. If Hostinger reports an upload limit anyway:

- Do not split the SQL file because that would break its single transaction and safety guards.
- Confirm that **SQL** is selected as the import format.
- Ask Hostinger support to increase or explain the phpMyAdmin upload limit for this database.
- Keep the original unmodified SQL file for the eventual import.

## If the import times out

- Do not refresh while phpMyAdmin is still working.
- If a timeout page appears, return to phpMyAdmin and inspect the result counts before retrying.
- Because the import uses a transaction, an interrupted connection should not leave the catalog half committed, but verify rather than assume.
- If the complete restored counts are present, do not immediately run it again; first confirm the result grids and application pages.
- If counts are incomplete or uncertain, restore the backup, confirm the original state, and retry during a lower-traffic period or ask Hostinger support to increase execution time.

## How to restore the backup

Only restore the backup when the import failed and you have confirmed that rollback or recovery is necessary.

1. Stop catalog editing in the admin panel.
2. In phpMyAdmin, select `u517869682_FoodonlineDB`.
3. Keep the failed-state database available until the error has been recorded.
4. Follow Hostinger's database-restore procedure or import the SQL backup downloaded in step 10.
5. Wait for the green success message and do not refresh during restoration.
6. Confirm `dried-food`, existing custom categories, users, and recent orders match the pre-import state.
7. Do not share the backup file publicly; it may contain private customer and account data.

If you are unsure whether a restore is necessary, contact Hostinger support before changing live rows.

## Final cache and browser check

After the database checks pass, purge the Cloudflare cache and use **Ctrl + F5**. Confirm the category and product admin pages load the restored database records and that category pages show 15 canonical products each. No application deployment is required for this SQL-only restoration.
