CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventKey` varchar(80) NOT NULL,
	`priority` int NOT NULL DEFAULT 1,
	`enabled` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_settings_eventKey_unique` UNIQUE(`eventKey`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int,
	`title` varchar(180) NOT NULL,
	`content` text NOT NULL,
	`kind` enum('info','success','error') NOT NULL DEFAULT 'info',
	`priority` int NOT NULL DEFAULT 1,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
