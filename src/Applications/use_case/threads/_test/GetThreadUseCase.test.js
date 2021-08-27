const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../../Domains/replies/entities/DetailReply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedReply = [{
      id: 'reply-123',
      username: 'mufti',
      date: '2021-08-26',
      content: DetailReply.DELETED_CONTENT_REPLY,
    }];

    const expectedComment = [{
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-26',
      content: 'sebuah comment',
      replies: [{ ...expectedReply[0] }],
    }];

    const expectedThread = new DetailThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-26',
      username: 'mufti',
      comments: [{ ...expectedComment[0] }],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.getReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReply));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadResult = await getThreadUseCase.execute(threadId);

    // Assert
    expect(getThreadResult).toStrictEqual(expectedThread);
  });
});
