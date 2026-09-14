CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`customerName` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`address` text NOT NULL,
	`notes` text,
	`items` text NOT NULL,
	`total` int NOT NULL,
	`paymentMethod` enum('upi','whatsapp') NOT NULL,
	`status` enum('new','confirmed','fulfilled','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
