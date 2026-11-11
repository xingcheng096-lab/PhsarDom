<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $database = strtolower((string) config('database.connections.'.config('database.default').'.database'));
        if (app()->environment('testing') && $database !== 'phsardom_test') {
            throw new RuntimeException('Database isolation violation: tests must use phsardom_test.');
        }
        if (in_array($database, ['phsadom', 'b2b-project'], true)) {
            throw new RuntimeException('Unsafe database target rejected by test isolation guard.');
        }
    }
}
