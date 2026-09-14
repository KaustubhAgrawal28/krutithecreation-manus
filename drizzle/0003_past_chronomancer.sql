ALTER TABLE `orders` ADD `policyVersion` varchar(32) DEFAULT '2026-09-14' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `termsAcceptedAt` timestamp NOT NULL;