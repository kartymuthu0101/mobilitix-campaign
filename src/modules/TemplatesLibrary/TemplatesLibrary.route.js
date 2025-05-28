import express from 'express';
import TemplateLibraryController from './TemplatesLibrary.controller.js';
import { folderCreateInput, folderListQueryValidation, updateFolderPermissionsInput, templateCreateInput, templateUpdateInput } from './TemplatesLibrary.validatory.js';
import { errHandle } from '../../helpers/constants/handleError.js';
import { checkPermission } from '../../common/middlewares/verifyToken.js';

const templateLibraryRouter = express.Router();
const templateLibraryController = new TemplateLibraryController();

/**
 * @swagger
 * /api/v1/template_library/search:
 *   get:
 *     summary: Search template library by name with pagination and channel filter
 *     tags:
 *       - Template Library
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search keyword to filter templates by name
 *         schema:
 *           type: string
 *           example: t
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: channelId
 *         required: true
 *         description: Channel ID to filter templates
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 832dee84-d13f-4106-8fad-62676ac92419
 *       - in: header
 *         name: authorization
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       childCount:
 *                         type: integer
 *                       breadcrumbs:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized or token expired
 *       500:
 *         description: Internal server error
 */
templateLibraryRouter.get('/search', templateLibraryController.searchTemplates);

/**
 * @swagger
 * /api/v1/template_library/path/{id}:
 *   get:
 *     summary: Get full path of a template or folder by ID
 *     tags:
 *       - Template Library
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the template or folder
 *         schema:
 *           type: string
 *           example: 32f65cec-7dea-40f2-b2da-26c6cdd69581
 *     responses:
 *       200:
 *         description: Successfully retrieved path hierarchy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 32f65cec-7dea-40f2-b2da-26c6cdd69581
 *                       name:
 *                         type: string
 *                         example: Three
 *                       parentId:
 *                         type: string
 *                         nullable: true
 *                         example: 374546cf-9383-41f0-b762-fe425986d3aa
 *       404:
 *         description: Template or folder not found
 *       500:
 *         description: Internal server error
 */
templateLibraryRouter.get('/path/:id', [], templateLibraryController.getTemplatePath);

/**
 * @swagger
 * /api/v1/template_library/whatsapp/folder:
 *   post:
 *     summary: Creates a folder
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/FolderInput'
 *               - $ref: '#/components/schemas/EncryptedFolderInput'
 *           examples:
 *             RegularPayload:
 *               summary: Regular folder payload
 *               value:
 *                 name: "Marketing Templates"
 *                 parentId: "60af8841d3e2f8a9c4567e13"
 *                 folderLocation: "ROOT"
 *                 type: "FOLDER"
 *                 channelId: "680b8a7cdd6e5ca7bc709edd"
 *             EncryptedPayload:
 *               summary: Encrypted input
 *               value:
 *                 input: "U2FsdGVkX19ceHn1s9HNbIfe95bqqC4HeXQGzYKDVBjyooDzjGqmT/YWloOCMHV5XRfpGusXxO8YfM39jwv6ZzCMpYwFirn7gGnpAn0rzrxT+YGf6WpivMR4ifwGJp/ygdMOguTmpDtN5nb6mrvT0Q=="
 *     responses:
 *       200:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FolderResponse'
 *             example:
 *               statusCode: 200
 *               message: "Folder created"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 name: "Marketing Templates"
 *                 parentId: "60af8841d3e2f8a9c4567e13"
 *                 type: "FOLDER"
 *                 channelId: "680b8a7cdd6e5ca7bc709edd"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"name\" is required"
 *                   path: ["name"]
 *                   type: "any.required"
 *                   context:
 *                     label: "name"
 *                     key: "name"
 *       404:
 *         description: Parent folder not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 *               data: null
 * components:
 *   schemas:
 *     FolderInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Marketing Templates"
 *         parentId:
 *           type: string
 *           example: "60af8841d3e2f8a9c4567e13"
 *         type:
 *           type: string
 *           enum: [FOLDER]
 *           example: "FOLDER"
 *         channelId:
 *           type: string
 *           description: ID of the channel
 *           example: "680b8a7cdd6e5ca7bc709edd"
 * 
 *     EncryptedFolderInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Encrypted or base64-encoded folder payload
 *           example: "U2FsdGVkX19ceHn1s9HNbIfe95bqqC4HeXQGzYKDVBjyooDzjGqmT/YWloOCMHV5XRfpGusXxO8YfM39jwv6ZzCMpYwFirn7gGnpAn0rzrxT+YGf6WpivMR4ifwGJp/ygdMOguTmpDtN5nb6mrvT0Q=="
 * 
 *     FolderResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "Folder created"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "661f123abdf65c0012345678"
 *             name:
 *               type: string
 *               example: "Marketing Templates"
 *             parentId:
 *               type: string
 *               example: "60af8841d3e2f8a9c4567e13"
 *             type:
 *               type: string
 *               example: "folder"
 *             channelId:
 *               type: string
 *               example: "680b8a7cdd6e5ca7bc709edd"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error summary
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"name\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 *               type:
 *                 type: string
 *                 example: "any.required"
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "name"
 *                   key:
 *                     type: string
 *                     example: "name"
 */
templateLibraryRouter.post('/whatsapp/folder', [folderCreateInput], templateLibraryController.createFolder);

/**
 * @swagger
 * /api/v1/template_library/whatsapp/folder:
 *   get:
 *     summary: List folders with optional filters, sorting, and pagination
 *     tags: [Folders]
 *     parameters:
 *       - in: query
 *         name: channelId
 *         schema:
 *           type: string
 *         description: ID of the channel
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the parent folder (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for folder names
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter folders created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter folders created before this date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: false
 *         description: Number of items per page (default is 10)
 *       - in: query
 *         name: isGlobalSearch
 *         schema:
 *           type: boolean
 *           default: false
 *         required: false
 *         description: Whether to perform a global search (default is false)
 *       - in: query
 *         name: onlyShared
 *         schema:
 *           type: boolean
 *           default: false
 *         required: false
 *         description: Whether to include only shared items (default is false)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, updatedAt, createdAt, childCount, folderChildCount, templateChildCount]
 *           default: updatedAt
 *         required: false
 *         description: Field to sort results by (default is updatedAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: integer
 *           enum: [1, -1]
 *           default: -1
 *         required: false
 *         description: Sort direction - 1 for ascending, -1 for descending (default is -1)
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [FOLDER_FIRST, TEMPLATE_FIRST, null]
 *           default: null
 *         required: false
 *         description: Type-based sorting preference - FOLDER_FIRST to display folders before templates, TEMPLATE_FIRST to display templates before folders
 *     responses:
 *       200:
 *         description: List of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Folders fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "661f123abdf65c0012345678"
 *                           name:
 *                             type: string
 *                             example: "Marketing Templates"
 *                           parentId:
 *                             type: string
 *                             example: "60af8841d3e2f8a9c4567e13"
 *                           type:
 *                             type: string
 *                             example: "folder"
 *                           channelId:
 *                             type: string
 *                             example: "680b8a7cdd6e5ca7bc709edd"
 *                           childCount:
 *                             type: integer
 *                             example: 5
 *                             description: Total number of child items
 *                           folderChildCount:
 *                             type: integer
 *                             example: 2
 *                             description: Number of folder children
 *                           templateChildCount:
 *                             type: integer
 *                             example: 3
 *                             description: Number of template children
 *                           isShared:
 *                             type: boolean
 *                             example: false
 *                             description: Whether the item is shared with the current user
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
templateLibraryRouter.get('/whatsapp/folder', [folderListQueryValidation], templateLibraryController.getAllFolder);

/**
 * @swagger
 * /api/v1/template_library/whatsapp/folder/permissions/{id}:
 *   patch:
 *     summary: Update folder permissions by adding or removing user access
 *     tags: [Folders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Folder ID
 *         schema:
 *           type: string
 *           example: 68107f59ccb488445a176284
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/FolderPermissionInput'
 *               - $ref: '#/components/schemas/EncryptedFolderPermissionInput'
 *           examples:
 *             RegularInput:
 *               summary: Regular folder permissions update
 *               value:
 *                 userIdsToAdd:
 *                   - userId: "680b432a4128eb84f7e918bb"
 *                     permission: "write"
 *                 userIdsToRemove:
 *                   - "6810a67a77815a2bd7399de7"
 *                 isNotifyPeople: true
 *             EncryptedInput:
 *               summary: Encrypted folder permissions update
 *               value:
 *                 input: "U2FsdGVkX1+eY1NkgR+e5FxplA=="
 *     responses:
 *       200:
 *         description: Folder permissions updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FolderPermissionResponse'
 *             example:
 *               statusCode: 200
 *               message: "Folder permissions updated"
 *               data:
 *                 _id: "680b658ae6289688abf503f4"
 *                 sharedWith:
 *                   - "680b432a4128eb84f7e918bb"
 *                   - "688b432a4128eb84f7e918cc"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"userIdsToAdd\" must be an array"
 *                   path: ["userIdsToAdd"]
 *                   type: "array.base"
 *                   context:
 *                     label: "userIdsToAdd"
 *                     key: "userIdsToAdd"
 *       404:
 *         description: Folder not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 *               data: null
 *
 * components:
 *   schemas:
 *     FolderPermissionInput:
 *       type: object
 *       properties:
 *         userIdsToAdd:
 *           type: array
 *           description: Array of user-permission pairs to be added
 *           items:
 *             type: object
 *             required:
 *               - userId
 *               - permission
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user
 *               permission:
 *                 type: string
 *                 description: Permission level (e.g., view, edit)
 *           example:
 *             - userId: "680b432a4128eb84f7e918bb"
 *               permission: "view"
 *         userIdsToRemove:
 *           type: array
 *           description: Array of user IDs to be removed
 *           items:
 *             type: string
 *           example:
 *             - "6810a67a77815a2bd7399de7"
 *         isNotifyPeople:
 *           type: boolean
 *           description: Whether to notify users about permission changes
 *           example: true
 *     EncryptedFolderPermissionInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Encrypted or base64-encoded input payload
 *           example: "U2FsdGVkX1+eY1NkgR+e5FxplA=="
 *     FolderPermissionResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "Folder permissions updated"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "680b658ae6289688abf503f4"
 *             sharedWith:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - "680b432a4128eb84f7e918bb"
 *                 - "688b432a4128eb84f7e918cc"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error summary
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"userIdsToAdd\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["userIdsToAdd"]
 *               type:
 *                 type: string
 *                 example: "any.required"
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "userIdsToAdd"
 *                   key:
 *                     type: string
 *                     example: "userIdsToAdd"
 */
templateLibraryRouter.patch('/whatsapp/folder/permissions/:id', [updateFolderPermissionsInput], templateLibraryController.updateFolderPermissions);

/**
 * @swagger
 * /api/v1/template_library/whatsapp/folder/permissions/{id}:
 *   get:
 *     summary: Get users with whom the folder is shared
 *     tags:
 *       - Folders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Folder ID
 *         schema:
 *           type: string
 *           example: 68107f59ccb488445a176284
 *     responses:
 *       200:
 *         description: Successfully retrieved shared user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68107f59ccb488445a176284
 *                     sharedWith:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 680b432a4128eb84f7e918bb
 *                           email:
 *                             type: string
 *                             example: user@example.com
 *       404:
 *         description: Folder not found
 *       500:
 *         description: Internal server error
 */
templateLibraryRouter.get('/whatsapp/folder/permissions/:id', [], templateLibraryController.getFolderPermissions);

/**
 * @swagger
 * /api/v1/template_library/whatsapp/template:
 *   post:
 *     summary: Create a new WhatsApp template with metadata and content blocks
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/TemplateWithMetadata'
 *               - $ref: '#/components/schemas/EncryptedTemplateInput'
 *           examples:
 *             RegularPayload:
 *               summary: Template with metadata and blocks
 *               value:
 *                 name: "Template 1"
 *                 language: ["en"]
 *                 templateType: "INITIATED"
 *                 category: "MARKETING"
 *                 blocks:
 *                   - type: "TEXT"
 *                     content: "Hello"
 *                     order: 1
 *                     tags: ["HEADER"]
 *             EncryptedPayload:
 *               summary: Encrypted input
 *               value:
 *                 input: "eyJmaWxlTmFtZSI6ICJXZWxjb21lX0VtYWlsLmh0bWwifQ=="
 *     responses:
 *       200:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *             example:
 *               statusCode: 200
 *               message: "OK"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 name: "Template 1"
 *                 blocks:
 *                   - contentBlockId: "6620112ebdf65c0012349876"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"name\" is required"
 *                   path: ["name"]
 *                   type: "any.required"
 *                   context:
 *                     label: "name"
 *                     key: "name"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 *               data: null
 * components:
 *   schemas:
 *     TemplateWithMetadata:
 *       type: object
 *       required: [name, language, templateType, category, blocks]
 *       properties:
 *         name:
 *           type: string
 *           example: "Template 1"
 *         language:
 *           type: array
 *           items:
 *             type: string
 *           example: ["en"]
 *         templateType:
 *           type: string
 *           enum: [INITIATED, REPLY]
 *           example: "INITIATED"
 *         category:
 *           type: string
 *           enum: [MARKETING, TRANSACTIONAL, OTP]
 *           example: "MARKETING"
 *         blocks:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/BlockWithTags'
 * 
 *     BlockWithTags:
 *       type: object
 *       required: [type, content, order, tags]
 *       properties:
 *         type:
 *           type: string
 *           enum: [TEXT, IMAGE, VIDEO]
 *           example: "TEXT"
 *         content:
 *           type: string
 *           example: "Hello"
 *         order:
 *           type: integer
 *           example: 1
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [HEADER, FOOTER]
 *           example: ["HEADER"]
 * 
 *     EncryptedTemplateInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Base64 encoded or encrypted payload
 *           example: "eyJmaWxlTmFtZSI6ICJXZWxjb21lX0VtYWlsLmh0bWwifQ=="
 * 
 *     TemplateResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "OK"
 *         data:
 *           $ref: '#/components/schemas/TemplateData'
 * 
 *     TemplateData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "661f123abdf65c0012345678"
 *         name:
 *           type: string
 *           example: "Template 1"
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlockReference'
 * 
 *     BlockReference:
 *       type: object
 *       properties:
 *         contentBlockId:
 *           type: string
 *           example: "6620112ebdf65c0012349876"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error summary
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"name\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 *               type:
 *                 type: string
 *                 example: "any.required"
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "name"
 *                   key:
 *                     type: string
 *                     example: "name"
 */
templateLibraryRouter.post('/whatsapp/template', [checkPermission("whatsappTemplate:create"), templateCreateInput], errHandle(templateLibraryController.createTemplate));

/**
 * @swagger
 * /api/v1/template_library/whatsapp/template:
 *   patch:
 *     summary: Update an existing template and its blocks
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateTemplateWithBlocks'
 *               - $ref: '#/components/schemas/EncryptedUpdateInput'
 *           examples:
 *             RegularUpdate:
 *               summary: Regular update payload
 *               value:
 *                 id: "661f123abdf65c0012345678"
 *                 fileName: "Updated_Welcome_Email.html"
 *                 blocks:
 *                   - id: "6620112ebdf65c0012349876"
 *                     content: "Updated welcome message!"
 *                     type: "html"
 *                     order: 1
 *             EncryptedUpdate:
 *               summary: Encrypted update input
 *               value:
 *                 input: "eyJfaWQiOiAiNjYxZjEyM2FiZGY2NWMwMDEyMzQ1Njc4IiwgImZpbGVOYW1lIjogIlVwZGF0ZWRfV2VsY29tZV9FbWFpbC5odG1sIn0="
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *             example:
 *               statusCode: 200
 *               message: "Template updated"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 fileName: "Updated_Welcome_Email.html"
 *                 name: "Welcome Email Template"
 *                 blocks:
 *                   - contentBlockId: "6620112ebdf65c0012349876"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"_id\" is required"
 *                   path: ["_id"]
 *                   type: "any.required"
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 * components:
 *   schemas:
 *     UpdateTemplateWithBlocks:
 *       type: object
 *       required: [id]
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the template to update
 *           example: "661f123abdf65c0012345678"
 *         fileName:
 *           type: string
 *           example: "Updated_Welcome_Email.html"
 *         name:
 *           type: string
 *           example: "Updated Welcome Email"
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentBlock'
 * 
 *     UpdateContentBlock:
 *       type: object
 *       required: [_id]
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the block to update
 *           example: "6620112ebdf65c0012349876"
 *         content:
 *           type: string
 *           example: "Updated content text"
 *         order:
 *           type: number
 *           example: 2
 * 
 *     EncryptedUpdateInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Base64 encoded update payload
 *           example: "eyJfaWQiOiAiNjYxZjEyM2FiZGY2NWMwMDEyMzQ1Njc4IiwgImZpbGVOYW1lIjogIlVwZGF0ZWRfV2VsY29tZV9FbWFpbC5odG1sIn0="
 * 
 *     # Reusing existing schemas from create operation
 *     TemplateResponse:
 *       $ref: '#/components/schemas/TemplateResponse'
 *     ErrorResponse:
 *       $ref: '#/components/schemas/ErrorResponse'
 */
templateLibraryRouter.patch('/whatsapp/template', [checkPermission("whatsappTemplate:edit"), templateUpdateInput], errHandle(templateLibraryController.updateTemplate));

/**
 * @swagger
 * /api/v1/template_library/whatsapp/template/{id}:
 *   get:
 *     summary: Get template details by ID including content blocks
 *     tags:
 *       - Template
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Template ID
 *         schema:
 *           type: string
 *           example: 680b658ae6289688abf503f4
 *     responses:
 *       200:
 *         description: Successfully retrieved template with content blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 680b658ae6289688abf503f4
 *                     name:
 *                       type: string
 *                       example: Template 1 updated
 *                     fileName:
 *                       type: string
 *                       example: New File updated
 *                     status:
 *                       type: string
 *                       example: draft
 *                     contentBlocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 680b661cc83886cc959b9fcc
 *                           type:
 *                             type: string
 *                             example: text
 *                           content:
 *                             type: string
 *                             example: this is text
 *                           templateId:
 *                             type: string
 *                             example: 680b658ae6289688abf503f4
 *                           id:
 *                             type: string
 *                             example: 680b661cc83886cc959b9fcc
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateLibraryRouter.get('/whatsapp/template/:id', [checkPermission("whatsappTemplate:view")], errHandle(templateLibraryController.getTemplate));

/**
 * @swagger
 * /api/v1/template_library/whatsapp/template/{id}:
 *   delete:
 *     summary: Soft delete a template by ID
 *     tags:
 *       - Template
 *     security:
 *       - bearerAuth: []  # JWT token for authorization
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the template to delete
 *         schema:
 *           type: string
 *           example: "123"
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Template deleted successfully
 *                 data:
 *                   type: object
 *                   example:
 *                     success: true
 *                     message: Template deleted successfully
 *       400:
 *         description: Template ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: Template ID is required
 *               data: null
 *       404:
 *         description: Template not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 404
 *               message: Template not found or already deleted
 *               data: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: Internal server error
 *               data: null
 *
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: Template not found
 *         data:
 *           nullable: true
 */
templateLibraryRouter.delete('/whatsapp/template/:id', [checkPermission("whatsappTemplate:delete")], errHandle(templateLibraryController.deleteTemplate));


/**
 * @swagger
 * /api/v1/template_library/web_push/folder:
 *   post:
 *     summary: Creates a folder
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/FolderInput'
 *               - $ref: '#/components/schemas/EncryptedFolderInput'
 *           examples:
 *             RegularPayload:
 *               summary: Regular folder payload
 *               value:
 *                 name: "Marketing Templates"
 *                 parentId: "60af8841d3e2f8a9c4567e13"
 *                 type: "FOLDER"
 *                 channelId: "680b8a7cdd6e5ca7bc709edd"
 *             EncryptedPayload:
 *               summary: Encrypted input
 *               value:
 *                 input: "U2FsdGVkX19ceHn1s9HNbIfe95bqqC4HeXQGzYKDVBjyooDzjGqmT/YWloOCMHV5XRfpGusXxO8YfM39jwv6ZzCMpYwFirn7gGnpAn0rzrxT+YGf6WpivMR4ifwGJp/ygdMOguTmpDtN5nb6mrvT0Q=="
 *     responses:
 *       200:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FolderResponse'
 *             example:
 *               statusCode: 200
 *               message: "Folder created"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 name: "Marketing Templates"
 *                 parentId: "60af8841d3e2f8a9c4567e13"
 *                 type: "FOLDER"
 *                 channelId: "680b8a7cdd6e5ca7bc709edd"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"name\" is required"
 *                   path: ["name"]
 *                   type: "any.required"
 *                   context:
 *                     label: "name"
 *                     key: "name"
 *       404:
 *         description: Parent folder not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 *               data: null
 * components:
 *   schemas:
 *     FolderInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Marketing Templates"
 *         parentId:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *           example: "60af8841d3e2f8a9c4567e13"
 *         type:
 *           type: string
 *           enum: [FOLDER]
 *           example: "FOLDER"
 *         channelId:
 *           type: string
 *           description: ID of the channel
 *           example: "680b8a7cdd6e5ca7bc709edd"
 *     EncryptedFolderInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Encrypted or base64-encoded folder payload
 *           example: "U2FsdGVkX19ceHn1s9HNbIfe95bqqC4HeXQGzYKDVBjyooDzjGqmT/YWloOCMHV5XRfpGusXxO8YfM39jwv6ZzCMpYwFirn7gGnpAn0rzrxT+YGf6WpivMR4ifwGJp/ygdMOguTmpDtN5nb6mrvT0Q=="
 * 
 *     FolderResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "Folder created"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "661f123abdf65c0012345678"
 *             name:
 *               type: string
 *               example: "Marketing Templates"
 *             parentId:
 *               type: string
 *               example: "60af8841d3e2f8a9c4567e13"
 *             type:
 *               type: string
 *               example: "folder"
 *             channelId:
 *               type: string
 *               example: "680b8a7cdd6e5ca7bc709edd"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error summary
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"name\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 *               type:
 *                 type: string
 *                 example: "any.required"
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "name"
 *                   key:
 *                     type: string
 *                     example: "name"
 */
templateLibraryRouter.post('/web_push/folder', [folderCreateInput], templateLibraryController.createFolder);

/**
 * @swagger
 * /api/v1/template_library/web_push/folder:
 *   get:
 *     summary: List folders with optional filters and pagination
 *     tags: [Folders]
 *     parameters:
 *       - in: query
 *         name: channelId
 *         schema:
 *           type: string
 *           format: hex
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: ID of the channel
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: hex
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         required: false
 *         description: ID of the parent folder (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for folder names
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter folders created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter folders created before this date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: false
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: List of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Folders fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "661f123abdf65c0012345678"
 *                           name:
 *                             type: string
 *                             example: "Marketing Templates"
 *                           parentId:
 *                             type: string
 *                             example: "60af8841d3e2f8a9c4567e13"
 *                           type:
 *                             type: string
 *                             example: "folder"
 *                           channelId:
 *                             type: string
 *                             example: "680b8a7cdd6e5ca7bc709edd"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
templateLibraryRouter.get('/web_push/folder', [folderListQueryValidation], templateLibraryController.getAllFolder);

/**
 * @swagger
 * /api/v1/template_library/web_push/template:
 *   post:
 *     summary: Create a new template with blocks
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/TemplateWithBlocks'
 *               - $ref: '#/components/schemas/EncryptedTemplateInput'
 *           examples:
 *             RegularPayload:
 *               summary: Regular payload with blocks
 *               value:
 *                 fileName: "Welcome_Email.html"
 *                 name: "Welcome Email Template"
 *                 blocks:
 *                   - type: "text"
 *                     content: "Welcome to our service!"
 *                     order: 1
 *             EncryptedPayload:
 *               summary: Encrypted input
 *               value:
 *                 input: "eyJmaWxlTmFtZSI6ICJXZWxjb21lX0VtYWlsLmh0bWwifQ=="
 *     responses:
 *       200:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *             example:
 *               statusCode: 200
 *               message: "OK"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 fileName: "Welcome_Email.html"
 *                 name: "Welcome Email Template"
 *                 blocks:
 *                   - contentBlockId: "6620112ebdf65c0012349876"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"fileName\" is required"
 *                   path: ["fileName"]
 *                   type: "any.required"
 *                   context:
 *                     label: "fileName"
 *                     key: "fileName"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 *               data: null
 * components:
 *   schemas:
 *     TemplateWithBlocks:
 *       type: object
 *       required: [fileName, name, blocks]
 *       properties:
 *         fileName:
 *           type: string
 *           example: "Welcome_Email.html"
 *         name:
 *           type: string
 *           example: "Welcome Email Template"
 *         channelId:
 *           type: string
 *           example: "5f8f8c44b54764421b7156c3"
 *         folderId:
 *           type: string
 *           example: "5f8f8c44b54764421b7156d1"
 *         layoutId:
 *           type: string
 *           example: "5f8f8c44b54764421b7156f7"
 *         blocks:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/ContentBlock'
 * 
 *     EncryptedTemplateInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Base64 encoded or encrypted payload
 *           example: "eyJmaWxlTmFtZSI6ICJXZWxjb21lX0VtYWlsLmh0bWwifQ=="
 * 
 *     ContentBlock:
 *       type: object
 *       required: [type, content, order]
 *       properties:
 *         type:
 *           type: string
 *           enum: [text, image, button]
 *           example: "text"
 *         content:
 *           type: string
 *           example: "Welcome to our service!"
 *         order:
 *           type: number
 *           example: 1
 * 
 *     TemplateResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "OK"
 *         data:
 *           $ref: '#/components/schemas/TemplateData'
 * 
 *     TemplateData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "661f123abdf65c0012345678"
 *         fileName:
 *           type: string
 *           example: "Welcome_Email.html"
 *         name:
 *           type: string
 *           example: "Welcome Email Template"
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlockReference'
 * 
 *     BlockReference:
 *       type: object
 *       properties:
 *         contentBlockId:
 *           type: string
 *           example: "6620112ebdf65c0012349876"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error summary
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"fileName\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["fileName"]
 *               type:
 *                 type: string
 *                 example: "any.required"
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "fileName"
 *                   key:
 *                     type: string
 *                     example: "fileName"
 */
templateLibraryRouter.post('/web_push/template', [templateCreateInput], errHandle(templateLibraryController.createTemplate));

/**
 * @swagger
 * /api/v1/template_library/web_push/template:
 *   patch:
 *     summary: Update an existing web push template and its blocks
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateTemplateWithMetadata'
 *               - $ref: '#/components/schemas/EncryptedUpdateInput'
 *           examples:
 *             RegularUpdate:
 *               summary: Update with metadata and blocks
 *               value:
 *                 id: "661f123abdf65c0012345678"
 *                 name: "Template 1"
 *                 language: ["en"]
 *                 templateType: "INITIATED"
 *                 category: "MARKETING"
 *                 blocks:
 *                   - id: "6620112ebdf65c0012349876"
 *                     type: "TEXT"
 *                     content: "Hello"
 *                     order: 1
 *                     tags: ["HEADER"]
 *             EncryptedUpdate:
 *               summary: Encrypted update input
 *               value:
 *                 input: "eyJfaWQiOiAiNjYxZjEyM2FiZGY2NWMwMDEyMzQ1Njc4IiwgIm5hbWUiOiAiVGVtcGxhdGUgMSJ9"
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *             example:
 *               statusCode: 200
 *               message: "Template updated"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 name: "Template 1"
 *                 blocks:
 *                   - contentBlockId: "6620112ebdf65c0012349876"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * components:
 *   schemas:
 *     UpdateTemplateWithMetadata:
 *       type: object
 *       required: [id]
 *       properties:
 *         id:
 *           type: string
 *           description: Template ID to update
 *           example: "661f123abdf65c0012345678"
 *         name:
 *           type: string
 *           example: "Template 1"
 *         language:
 *           type: array
 *           items:
 *             type: string
 *           example: ["en"]
 *         templateType:
 *           type: string
 *           enum: [INITIATED, REPLY]
 *           example: "INITIATED"
 *         category:
 *           type: string
 *           enum: [MARKETING, TRANSACTIONAL, OTP]
 *           example: "MARKETING"
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UpdateBlockWithTags'
 *
 *     UpdateBlockWithTags:
 *       type: object
 *       required: [id, type, content, order, tags]
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the block
 *           example: "6620112ebdf65c0012349876"
 *         type:
 *           type: string
 *           enum: [TEXT, IMAGE, VIDEO]
 *           example: "TEXT"
 *         content:
 *           type: string
 *           example: "Hello"
 *         order:
 *           type: integer
 *           example: 1
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [HEADER, FOOTER]
 *           example: ["HEADER"]
 *
 *     EncryptedUpdateInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Base64 encoded update payload
 *           example: "eyJfaWQiOiAiNjYxZjEyM2FiZGY2NWMwMDEyMzQ1Njc4IiwgIm5hbWUiOiAiVGVtcGxhdGUgMSJ9"
 *
 *     TemplateResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "Template updated"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "661f123abdf65c0012345678"
 *             name:
 *               type: string
 *               example: "Template 1"
 *             blocks:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlockReference'
 *
 *     BlockReference:
 *       type: object
 *       properties:
 *         contentBlockId:
 *           type: string
 *           example: "6620112ebdf65c0012349876"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 400
 *         message:
 *           type: string
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"name\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                   key:
 *                     type: string
 */
templateLibraryRouter.patch('/web_push/template', [templateUpdateInput], errHandle(templateLibraryController.updateTemplate));

/**
 * @swagger
 * /api/v1/template_library/web_push/template/{id}:
 *   get:
 *     summary: Get template details by ID including content blocks
 *     tags:
 *       - Template
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Template ID
 *         schema:
 *           type: string
 *           example: 680b658ae6289688abf503f4
 *     responses:
 *       200:
 *         description: Successfully retrieved template with content blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 680b658ae6289688abf503f4
 *                     name:
 *                       type: string
 *                       example: Template 1 updated
 *                     fileName:
 *                       type: string
 *                       example: New File updated
 *                     status:
 *                       type: string
 *                       example: draft
 *                     contentBlocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 680b661cc83886cc959b9fcc
 *                           type:
 *                             type: string
 *                             example: text
 *                           content:
 *                             type: string
 *                             example: this is text
 *                           templateId:
 *                             type: string
 *                             example: 680b658ae6289688abf503f4
 *                           id:
 *                             type: string
 *                             example: 680b661cc83886cc959b9fcc
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateLibraryRouter.get('/web_push/template/:id', [], errHandle(templateLibraryController.getTemplate));



/**
 * @swagger
 * /api/v1/template_library/app_push/folder:
 *   post:
 *     summary: Creates a folder
 *     tags: [Folders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/FolderInput'
 *               - $ref: '#/components/schemas/EncryptedFolderInput'
 *           examples:
 *             RegularPayload:
 *               summary: Regular folder payload
 *               value:
 *                 name: "Marketing Templates"
 *                 parentId: "60af8841d3e2f8a9c4567e13"
 *                 type: "FOLDER"
 *                 channelId: "680b8a7cdd6e5ca7bc709edd"
 *             EncryptedPayload:
 *               summary: Encrypted input
 *               value:
 *                 input: "U2FsdGVkX19ceHn1s9HNbIfe95bqqC4HeXQGzYKDVBjyooDzjGqmT/YWloOCMHV5XRfpGusXxO8YfM39jwv6ZzCMpYwFirn7gGnpAn0rzrxT+YGf6WpivMR4ifwGJp/ygdMOguTmpDtN5nb6mrvT0Q=="
 *     responses:
 *       200:
 *         description: Folder created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FolderResponse'
 *             example:
 *               statusCode: 200
 *               message: "Folder created"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 name: "Marketing Templates"
 *                 parentId: "60af8841d3e2f8a9c4567e13"
 *                 type: "FOLDER"
 *                 channelId: "680b8a7cdd6e5ca7bc709edd"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"name\" is required"
 *                   path: ["name"]
 *                   type: "any.required"
 *                   context:
 *                     label: "name"
 *                     key: "name"
 *       404:
 *         description: Parent folder not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 *               data: null
 * components:
 *   schemas:
 *     FolderInput:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Marketing Templates"
 *         parentId:
 *           type: string
 *           pattern: "^[a-fA-F0-9]{24}$"
 *           example: "60af8841d3e2f8a9c4567e13"
 *         type:
 *           type: string
 *           enum: [FOLDER]
 *           example: "FOLDER"
 *         channelId:
 *           type: string
 *           description: ID of the channel
 *           example: "680b8a7cdd6e5ca7bc709edd"
 * 
 *     EncryptedFolderInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Encrypted or base64-encoded folder payload
 *           example: "U2FsdGVkX19ceHn1s9HNbIfe95bqqC4HeXQGzYKDVBjyooDzjGqmT/YWloOCMHV5XRfpGusXxO8YfM39jwv6ZzCMpYwFirn7gGnpAn0rzrxT+YGf6WpivMR4ifwGJp/ygdMOguTmpDtN5nb6mrvT0Q=="
 * 
 *     FolderResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "Folder created"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "661f123abdf65c0012345678"
 *             name:
 *               type: string
 *               example: "Marketing Templates"
 *             parentId:
 *               type: string
 *               example: "60af8841d3e2f8a9c4567e13"
 *             type:
 *               type: string
 *               example: "folder"
 *             channelId:
 *               type: string
 *               example: "680b8a7cdd6e5ca7bc709edd"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Error summary
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "\"name\" is required"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["name"]
 *               type:
 *                 type: string
 *                 example: "any.required"
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "name"
 *                   key:
 *                     type: string
 *                     example: "name"
 */
templateLibraryRouter.post('/app_push/folder', [folderCreateInput], templateLibraryController.createFolder);

/**
 * @swagger
 * /api/v1/template_library/app_push/folder:
 *   get:
 *     summary: List folders with optional filters and pagination
 *     tags: [Folders]
 *     parameters:
 *       - in: query
 *         name: channelId
 *         schema:
 *           type: string
 *           format: hex
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         description: ID of the channel
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: hex
 *           pattern: "^[a-fA-F0-9]{24}$"
 *         required: false
 *         description: ID of the parent folder (optional)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for folder names
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter folders created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter folders created before this date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: false
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: List of folders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Folders fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 100
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "661f123abdf65c0012345678"
 *                           name:
 *                             type: string
 *                             example: "Marketing Templates"
 *                           parentId:
 *                             type: string
 *                             example: "60af8841d3e2f8a9c4567e13"
 *                           type:
 *                             type: string
 *                             example: "folder"
 *                           channelId:
 *                             type: string
 *                             example: "680b8a7cdd6e5ca7bc709edd"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
templateLibraryRouter.get('/app_push/folder', [folderListQueryValidation], templateLibraryController.getAllFolder);

/**
 * @swagger
 * /api/v1/template_library/app_push/template:
 *   post:
 *     summary: Create a new app push template with blocks
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/TemplateWithMetadata'
 *               - $ref: '#/components/schemas/EncryptedTemplateInput'
 *           examples:
 *             RegularPayload:
 *               summary: Regular template payload
 *               value:
 *                 name: "Template 1"
 *                 language: ["en"]
 *                 templateType: "INITITATED"
 *                 category: "MARKETING"
 *                 blocks:
 *                   - type: "TEXT"
 *                     content: "Hello"
 *                     order: 1
 *                     tags: ["HEADER"]
 *             EncryptedPayload:
 *               summary: Encrypted input
 *               value:
 *                 input: "eyJuYW1lIjogIlRlbXBsYXRlIDEiLCAiYmxvY2tzIjogW3sgInR5cGUiOiAiVEVYVCIsICJjb250ZW50IjogIkhlbGxvIiwgIm9yZGVyIjogMSwgInRhZ3MiOiBbIkhFQURFUiJdfV19"
 *     responses:
 *       200:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * components:
 *   schemas:
 *     TemplateWithMetadata:
 *       type: object
 *       required: [name, language, templateType, category, blocks]
 *       properties:
 *         name:
 *           type: string
 *           example: "Template 1"
 *         language:
 *           type: array
 *           items:
 *             type: string
 *           example: ["en"]
 *         templateType:
 *           type: string
 *           enum: [INITITATED, REPLY]
 *           example: "INITITATED"
 *         category:
 *           type: string
 *           enum: [MARKETING, TRANSACTIONAL, OTP]
 *           example: "MARKETING"
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentBlockWithTags'
 * 
 *     ContentBlockWithTags:
 *       type: object
 *       required: [type, content, order, tags]
 *       properties:
 *         type:
 *           type: string
 *           enum: [TEXT, IMAGE, VIDEO]
 *           example: "TEXT"
 *         content:
 *           type: string
 *           example: "Hello"
 *         order:
 *           type: number
 *           example: 1
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             enum: [HEADER, FOOTER]
 *           example: ["HEADER"]
 * 
 *     EncryptedTemplateInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Encrypted or base64-encoded template payload
 *           example: "eyJuYW1lIjogIlRlbXBsYXRlIDEiLCAiYmxvY2tzIjogW3sgInR5cGUiOiAiVEVYVCIsICJjb250ZW50IjogIkhlbGxvIiwgIm9yZGVyIjogMSwgInRhZ3MiOiBbIkhFQURFUiJdfV19"
 * 
 *     TemplateResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           example: 200
 *         message:
 *           type: string
 *           example: "OK"
 *         data:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "661f123abdf65c0012345678"
 *             name:
 *               type: string
 *               example: "Template 1"
 *             blocks:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BlockReference'
 * 
 *     BlockReference:
 *       type: object
 *       properties:
 *         contentBlockId:
 *           type: string
 *           example: "6620112ebdf65c0012349876"
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           example: 400
 *         message:
 *           type: string
 *           example: "Bad Request"
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *               context:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                   key:
 *                     type: string
 */
templateLibraryRouter.post('/app_push/template', [templateCreateInput], errHandle(templateLibraryController.createTemplate));

/**
 * @swagger
 * /api/v1/template_library/app_push/template:
 *   patch:
 *     summary: Update an existing template and its blocks
 *     tags: [Template]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UpdateTemplateWithBlocks'
 *               - $ref: '#/components/schemas/EncryptedUpdateInput'
 *           examples:
 *             RegularUpdate:
 *               summary: Regular update payload
 *               value:
 *                 id: "661f123abdf65c0012345678"
 *                 fileName: "Updated_Welcome_Email.html"
 *                 blocks:
 *                   - id: "6620112ebdf65c0012349876"
 *                     content: "Updated welcome message!"
 *                     type: "html"
 *                     order: 1
 *             EncryptedUpdate:
 *               summary: Encrypted update input
 *               value:
 *                 input: "eyJfaWQiOiAiNjYxZjEyM2FiZGY2NWMwMDEyMzQ1Njc4IiwgImZpbGVOYW1lIjogIlVwZGF0ZWRfV2VsY29tZV9FbWFpbC5odG1sIn0="
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TemplateResponse'
 *             example:
 *               statusCode: 200
 *               message: "Template updated"
 *               data:
 *                 _id: "661f123abdf65c0012345678"
 *                 fileName: "Updated_Welcome_Email.html"
 *                 name: "Welcome Email Template"
 *                 blocks:
 *                   - contentBlockId: "6620112ebdf65c0012349876"
 *       400:
 *         description: Bad Request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               message: "Bad Request"
 *               data:
 *                 - message: "\"_id\" is required"
 *                   path: ["_id"]
 *                   type: "any.required"
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 500
 *               message: "Internal server error"
 * components:
 *   schemas:
 *     UpdateTemplateWithBlocks:
 *       type: object
 *       required: [id]
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the template to update
 *           example: "661f123abdf65c0012345678"
 *         fileName:
 *           type: string
 *           example: "Updated_Welcome_Email.html"
 *         name:
 *           type: string
 *           example: "Updated Welcome Email"
 *         blocks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentBlock'
 * 
 *     UpdateContentBlock:
 *       type: object
 *       required: [_id]
 *       properties:
 *         _id:
 *           type: string
 *           description: ID of the block to update
 *           example: "6620112ebdf65c0012349876"
 *         content:
 *           type: string
 *           example: "Updated content text"
 *         order:
 *           type: number
 *           example: 2
 * 
 *     EncryptedUpdateInput:
 *       type: object
 *       required: [input]
 *       properties:
 *         input:
 *           type: string
 *           description: Base64 encoded update payload
 *           example: "eyJfaWQiOiAiNjYxZjEyM2FiZGY2NWMwMDEyMzQ1Njc4IiwgImZpbGVOYW1lIjogIlVwZGF0ZWRfV2VsY29tZV9FbWFpbC5odG1sIn0="
 * 
 *     # Reusing existing schemas from create operation
 *     TemplateResponse:
 *       $ref: '#/components/schemas/TemplateResponse'
 *     ErrorResponse:
 *       $ref: '#/components/schemas/ErrorResponse'
 */
templateLibraryRouter.patch('/app_push/template', [templateUpdateInput], errHandle(templateLibraryController.updateTemplate));

/**
 * @swagger
 * /api/v1/template_library/app_push/template/{id}:
 *   get:
 *     summary: Get template details by ID including content blocks
 *     tags:
 *       - Template
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Template ID
 *         schema:
 *           type: string
 *           example: 680b658ae6289688abf503f4
 *     responses:
 *       200:
 *         description: Successfully retrieved template with content blocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 680b658ae6289688abf503f4
 *                     name:
 *                       type: string
 *                       example: Template 1 updated
 *                     fileName:
 *                       type: string
 *                       example: New File updated
 *                     status:
 *                       type: string
 *                       example: draft
 *                     contentBlocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 680b661cc83886cc959b9fcc
 *                           type:
 *                             type: string
 *                             example: text
 *                           content:
 *                             type: string
 *                             example: this is text
 *                           templateId:
 *                             type: string
 *                             example: 680b658ae6289688abf503f4
 *                           id:
 *                             type: string
 *                             example: 680b661cc83886cc959b9fcc
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateLibraryRouter.get('/app_push/template/:id', [], errHandle(templateLibraryController.getTemplate));

export default templateLibraryRouter;