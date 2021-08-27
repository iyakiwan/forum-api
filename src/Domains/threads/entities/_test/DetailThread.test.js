const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-27',
      username: 'Mufti',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-27',
      username: 'Mufti',
      comments: [{
        replies: {},
      }],
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-27',
      username: 'Mufti',
      comments: [{
        id: 'comment-123',
        content: 'sebuah comment',
        username: 'dicoding',
        date: '2021-08-27',
        replies: [{
          id: 'reply-123',
          content: 'sebuah reply',
          username: 'mufti',
          date: '2021-08-27',
        }],
      }],
    };

    // Action
    const {
      id, comments,
    } = new DetailThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(comments[0].id).toEqual(payload.comments[0].id);
    expect(comments[0].replies[0].id).toEqual(payload.comments[0].replies[0].id);
  });
});
