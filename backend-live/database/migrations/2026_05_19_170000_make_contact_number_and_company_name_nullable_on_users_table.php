<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'contact_number')) {
            $this->makeColumnNullable('users', 'contact_number');
        }

        if (Schema::hasColumn('users', 'company_name')) {
            $this->makeColumnNullable('users', 'company_name');
        }
    }

    public function down(): void
    {
        // Intentionally left blank.
        // Reverting nullable changes in production can break existing data writes.
    }

    private function makeColumnNullable(string $table, string $column): void
    {
        if ($this->isMySqlLikeConnection()) {
            $this->makeMySqlColumnNullable($table, $column);

            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($column): void {
            $blueprint->string($column)->nullable()->change();
        });
    }

    private function isMySqlLikeConnection(): bool
    {
        return in_array(DB::getDriverName(), ['mysql', 'mariadb'], true);
    }

    private function makeMySqlColumnNullable(string $table, string $column): void
    {
        $database = DB::getDatabaseName();

        if (! is_string($database) || $database === '') {
            return;
        }

        $metadata = DB::table('information_schema.columns')
            ->select(['COLUMN_TYPE', 'COLUMN_DEFAULT'])
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', $table)
            ->where('COLUMN_NAME', $column)
            ->first();

        if ($metadata === null || ! isset($metadata->COLUMN_TYPE)) {
            return;
        }

        $columnType = (string) $metadata->COLUMN_TYPE;
        $defaultClause = $metadata->COLUMN_DEFAULT !== null
            ? ' DEFAULT '.DB::getPdo()->quote((string) $metadata->COLUMN_DEFAULT)
            : '';

        DB::statement(sprintf(
            'ALTER TABLE `%s` MODIFY `%s` %s NULL%s',
            $table,
            $column,
            $columnType,
            $defaultClause,
        ));
    }
};
