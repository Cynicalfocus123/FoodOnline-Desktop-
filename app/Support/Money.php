<?php

namespace App\Support;

use InvalidArgumentException;

final class Money
{
    public static function fromDecimal(string|int|float $amount): int
    {
        $value = trim((string) $amount);
        if (! preg_match('/^(\d+)(?:\.(\d{1,}))?$/', $value, $matches)) {
            throw new InvalidArgumentException('Invalid money amount.');
        }

        $fraction = str_pad(substr($matches[2] ?? '', 0, 2), 2, '0');

        return ((int) $matches[1] * 100) + (int) $fraction;
    }

    public static function decimal(int $minor): string
    {
        return number_format($minor / 100, 2, '.', '');
    }
}
