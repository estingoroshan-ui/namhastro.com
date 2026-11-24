-- NAMH ASTRO — Step 1 Foundational Database Migration (MySQL / MariaDB)
-- Migration: 20261124000000_init_foundation

CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('CUSTOMER', 'ASTROLOGER', 'SUPPORT', 'FINANCE', 'VERIFICATION', 'MARKETING', 'SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `status` ENUM('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `fullName` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `phoneE164` VARCHAR(20) NULL,
    `phoneVerifiedAt` DATETIME(3) NULL,
    `passwordHash` VARCHAR(255) NULL,
    `preferredLanguage` VARCHAR(16) NOT NULL DEFAULT 'en',
    `mfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    `termsAcceptedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phoneE164_key`(`phoneE164`),
    INDEX `users_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `astrologer_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(140) NOT NULL,
    `displayName` VARCHAR(120) NOT NULL,
    `verificationStage` ENUM('APPLIED', 'DOC_VERIFICATION', 'INTERVIEW', 'APPROVED', 'TRAINING', 'ACTIVE', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'APPLIED',
    `availabilityStatus` ENUM('OFFLINE', 'ONLINE', 'BUSY') NOT NULL DEFAULT 'OFFLINE',
    `chatEnabled` BOOLEAN NOT NULL DEFAULT false,
    `audioEnabled` BOOLEAN NOT NULL DEFAULT false,
    `videoEnabled` BOOLEAN NOT NULL DEFAULT false,
    `experienceYears` INTEGER NOT NULL DEFAULT 0,
    `bio` TEXT NULL,
    `qualifications` TEXT NULL,
    `chatRatePaise` INTEGER NOT NULL DEFAULT 0,
    `audioRatePaise` INTEGER NOT NULL DEFAULT 0,
    `videoRatePaise` INTEGER NOT NULL DEFAULT 0,
    `commissionBpsOverride` INTEGER NULL,
    `avatarUrl` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `astrologer_profiles_userId_key`(`userId`),
    UNIQUE INDEX `astrologer_profiles_slug_key`(`slug`),
    INDEX `astrologer_profiles_verificationStage_availabilityStatus_idx`(`verificationStage`, `availabilityStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `paidBalancePaise` BIGINT NOT NULL DEFAULT 0,
    `promoBalancePaise` BIGINT NOT NULL DEFAULT 0,
    `refundBalancePaise` BIGINT NOT NULL DEFAULT 0,
    `version` INTEGER NOT NULL DEFAULT 1,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wallets_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallet_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(128) NOT NULL,
    `type` ENUM('WALLET_RECHARGE', 'PROMO_CREDIT', 'CONSULTATION_DEBIT', 'LIVE_QUESTION_DEBIT', 'PUJA_PAYMENT', 'STORE_PAYMENT', 'REFUND_CREDIT', 'ADMIN_ADJUSTMENT') NOT NULL,
    `amountPaise` BIGINT NOT NULL,
    `balanceAfterPaise` BIGINT NOT NULL,
    `referenceType` VARCHAR(64) NULL,
    `referenceId` VARCHAR(128) NULL,
    `description` VARCHAR(255) NOT NULL,
    `metadataJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wallet_transactions_idempotencyKey_key`(`idempotencyKey`),
    INDEX `wallet_transactions_walletId_createdAt_idx`(`walletId`, `createdAt`),
    INDEX `wallet_transactions_referenceType_referenceId_idx`(`referenceType`, `referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `system_settings` (
    `key` VARCHAR(120) NOT NULL,
    `valueJson` JSON NOT NULL,
    `description` VARCHAR(255) NULL,
    `updatedBy` VARCHAR(64) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NULL,
    `action` VARCHAR(120) NOT NULL,
    `entityType` VARCHAR(80) NOT NULL,
    `entityId` VARCHAR(128) NULL,
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` VARCHAR(255) NULL,
    `payloadJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_actorUserId_createdAt_idx`(`actorUserId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `astrologer_profiles` ADD CONSTRAINT `astrologer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `wallet_transactions` ADD CONSTRAINT `wallet_transactions_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
