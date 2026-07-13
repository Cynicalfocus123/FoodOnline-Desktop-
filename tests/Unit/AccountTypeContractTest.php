<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class AccountTypeContractTest extends TestCase
{
    public function test_supported_public_account_types_remain_stable(): void
    {
        /** @var array<string, mixed> $configuration */
        $configuration = require dirname(__DIR__, 2).'/config/foodonlines.php';

        $this->assertSame(
            ['customer', 'supplier', 'partner'],
            $configuration['supported_account_types'],
        );
    }
}
