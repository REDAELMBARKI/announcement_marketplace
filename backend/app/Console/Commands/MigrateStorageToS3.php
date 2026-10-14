<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateStorageToS3 extends Command
{
    protected $signature = 'storage:migrate-to-s3 {--dry-run : Show what would be migrated without actually doing it}';

    protected $description = 'Migrate all files from local public storage to S3';

    public function handle(): int
    {
        $localDisk = Storage::disk('public');
        $s3Disk = Storage::disk('s3');

        $files = $localDisk->allFiles();

        if (empty($files)) {
            $this->info('No files found in local storage. Nothing to migrate.');
            return 0;
        }

        $this->info("Found " . count($files) . " files to migrate.");

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN — no files will be copied.');
            foreach ($files as $file) {
                $size = round($localDisk->size($file) / 1024, 1);
                $this->line("  Would copy: {$file} ({$size} KB)");
            }
            $this->info("Total: " . count($files) . " files");
            return 0;
        }

        $bar = $this->output->createProgressBar(count($files));
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($files as $file) {
            try {
                $stream = $localDisk->readStream($file);
                $s3Disk->writeStream($file, $stream, ['visibility' => 'public']);
                if (is_resource($stream)) {
                    fclose($stream);
                }
                $success++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Failed to migrate: {$file} — {$e->getMessage()}");
                $failed++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Migration complete!");
        $this->info("  ✅ Migrated: {$success}");
        if ($failed > 0) {
            $this->error("  ❌ Failed: {$failed}");
        }

        return $failed > 0 ? 1 : 0;
    }
}
