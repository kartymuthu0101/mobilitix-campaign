/**
 * Template status constants
 */
export const TEMPLATE_STATUS = {
    DRAFT: "DRAFT",
    CREATED: "CREATED",
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
    DELETED: "DELETED"
};

/**
 * Template type constants
 */
export const TEMPLATE_TYPE = {
    TEMPLATE: "TEMPLATE",
    FOLDER: "FOLDER"
};

/**
 * Content block type constants
 */
export const CONTENT_BLOCK_TYPES = {
    HTML: "HTML",
    TEXT: "TEXT",
    BUTTON: "BUTTON",
    IMAGE: "IMAGE",
    DOCUMENT: "DOCUMENT",
    VIDEO: "VIDEO"
};

/**
 * Master data type constants
 */
export const MASTER_DATA_TYPES = {
    LANGUAGE: "LANGUAGE",
    TEMPLATE_TYPE: "TEMPLATE_TYPE",
    TEMPLATE_CATEGORY: "TEMPLATE_CATEGORY",
};

/**
 * Folder location constants
 */
export const FOLDER_LOCATION = {
    ENTERPRISE_TEMPLATE: "ENTERPRISE_TEMPLATE",
    MOBILYTIX_TEMPLATE: "MOBILYTIX_TEMPLATE"
};

/**
 * Maximum count constants
 */
export const MAX_COUNTS = {
    SUB_FOLDERS: 10
};

/**
 * Content block tag constants
 */
export const CONTENT_BLOCK_TAGS = {
    HEADER: "HEADER",
    BODY: "BODY",
    FOOTER: "FOOTER",
    SHORTEN: "SHORTEN"
};

/**
 * WhatsApp template button type constants
 */
export const WHATSAPP_TEMPLATE_BUTTON_TYPE = {
    QUICK_REPLY: "QUICK_REPLY",
    CALL_TO_ACTION: "CALL_TO_ACTION"
};

export const TEMPLATE_LOG_ACTIONS = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    SUBMITTED_FOR_APPROVAL: "SUBMITTED_FOR_APPROVAL",
    REVIEWED: "REVIEWED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",

}

export const TEMPLATE_APPROVAL_STATUS = {
    ACTIVE: "ACTIVE",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    CLOSED: "CLOSED"
}

export const ESCALATION_MATRIX_PRIORITIES = {
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
}