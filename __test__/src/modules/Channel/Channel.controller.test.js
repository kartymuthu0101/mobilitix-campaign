// const ChannelController = require('../../../src/modules/Channels/'); // adjust path
// const Channel = require('./Channel.model'); // adjust path

// jest.mock('./Channel.model');  // mock the Channel model

// describe('GET /api/v1/channel-data/get-all-channel', () => {
//   it('should fetch all items', async () => {
//     const mockData = [
//       {
//         id: '680b8a7cdd6e5ca7bc709edd',
//         channel_name: 'WhatsApp',
//         description: 'WhatsApp channel',
//       }
//     ];

//     Channel.find.mockResolvedValue(mockData);  // mock the `.find()` method

//     // Mock req and res
//     const req = {};
//     const res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };

//     await ChannelController.getAllChannels(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(mockData);
//     expect(res.json.mock.calls[0][0][0]).toHaveProperty('id');
//     expect(res.json.mock.calls[0][0][0]).toHaveProperty('channel_name');
//   });
// });
