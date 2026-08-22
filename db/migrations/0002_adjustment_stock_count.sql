ALTER TABLE `movements` ADD `stock_count_id` integer REFERENCES `stock_counts`(`id`);
