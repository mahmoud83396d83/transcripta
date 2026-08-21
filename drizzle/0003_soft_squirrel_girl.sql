CREATE TABLE `notification_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionKey` varchar(64) NOT NULL,
	`title` varchar(180) NOT NULL,
	`content` text NOT NULL,
	`kind` enum('info','success','error') NOT NULL DEFAULT 'info',
	`important` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_logs_id` PRIMARY KEY(`id`)
);
