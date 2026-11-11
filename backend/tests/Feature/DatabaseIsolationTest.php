<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseIsolationTest extends TestCase
{
    public function test_tests_are_connected_to_the_isolated_database(): void
    {
        $this->assertSame('phsardom_test', strtolower(DB::selectOne('select current_database() as name')->name));
    }
}
