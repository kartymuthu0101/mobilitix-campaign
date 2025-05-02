const mongoose = require('mongoose');
const TemplateLibraryController = require('../../../../src/modules/TemplatesLibrary/TemplatesLibrary.controller');

jest.mock('mongoose');

describe('TemplateLibraryController - createTemplate', () => {
    let controller;
    let req, res, session;

    beforeEach(() => {
        req = {
            body: {
                fileName: 'Welcome_Email.html',
                name: 'Welcome Email Template',
                blocks: [
                    { type: 'text', content: 'Hello', order: 1 }
                ]
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        session = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        };
        mongoose.startSession.mockResolvedValue(session);

        controller = new TemplateLibraryController();
        // Mock service methods
        controller.templateLibraryService.create = jest.fn().mockResolvedValue({ _id: 'templateId123' });
        controller.contentBlockService.bulkCreate = jest.fn().mockResolvedValue([{ _id: 'block1' }]);
        controller.templateLibraryService.update = jest.fn().mockResolvedValue({
            _id: 'templateId123',
            blocks: [{ contentBlockId: 'block1' }]
        });

        controller.sendResponse = jest.fn();
    });

    it('should create template, blocks, update template and respond successfully', async () => {
        await controller.createTemplate(req, res);

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(session.startTransaction).toHaveBeenCalled();

        expect(controller.templateLibraryService.create).toHaveBeenCalledWith(
            expect.objectContaining({ fileName: 'Welcome_Email.html', name: 'Welcome Email Template', }),
            { lean: true },
            { session }
        );

        expect(controller.contentBlockService.bulkCreate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ content: 'Hello', templateId: 'templateId123' })
            ]),
            { lean: true },
            { session }
        );

        expect(controller.templateLibraryService.update).toHaveBeenCalledWith(
            'templateId123',
            { blocks: [{ contentBlockId: 'block1' }] },
            {},
            { session, new: true }
        );

        expect(session.commitTransaction).toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();

        expect(controller.sendResponse).toHaveBeenCalled();
    });

    it('should abort transaction and throw error on failure', async () => {
        controller.templateLibraryService.create.mockRejectedValue(new Error('DB Error'));

        await expect(controller.createTemplate(req, res)).rejects.toThrow('DB Error');

        expect(session.abortTransaction).toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalled();
    });
});
