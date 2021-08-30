const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.verifyAvailableReply = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockReplyRepository.verifyAvailableReply).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId);
  });
});
