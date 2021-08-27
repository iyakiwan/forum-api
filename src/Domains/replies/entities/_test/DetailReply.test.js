const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Sebuah reply',
      date: '2021-08-27',
      username: 'Mufti',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'Sebuah reply',
      date: '2021-08-27',
      username: 'Mufti',
      isDelete: 'tidak',
    };

    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'Sebuah reply',
      date: '2021-08-27',
      username: 'Mufti',
      isDelete: true,
    };

    // Action
    const {
      id, content, date, username, isDelete,
    } = new DetailReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(DetailReply.DELETED_CONTENT_REPLY);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
  });
});
