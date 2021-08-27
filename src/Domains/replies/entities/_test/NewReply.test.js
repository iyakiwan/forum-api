const NewReply = require('../NewReply');

describe('a NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
      threadId: 'abc',
      commentId: 'abc',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'abc',
      threadId: 'abc',
      commentId: 'abc',
      owner: 'user-123',
      date: 2323,
    };

    // Action and Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
      date: '2021-08-26',
    };

    // Action
    const {
      content, threadId, commentId, owner, date,
    } = new NewReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
    expect(date).toEqual(payload.date);
  });
});
