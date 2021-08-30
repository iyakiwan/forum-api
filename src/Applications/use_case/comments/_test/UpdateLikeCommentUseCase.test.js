const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const UpdateLikeCommentUseCase = require('../UpdateLikeCommentUseCase');

describe('UpdateLikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the update like comment action correctly when comment not liked', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyLikeInComment = jest.fn(() => Promise.resolve(false));
    mockCommentRepository.addLikeInComment = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const updateLikeCommentUseCase = new UpdateLikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await updateLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.verifyLikeInComment).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.addLikeInComment).toBeCalledWith(useCasePayload);
  });

  it('should orchestrating the update like comment action correctly when comment liked', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockCommentRepository.verifyComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyLikeInComment = jest.fn(() => Promise.resolve(true));
    mockCommentRepository.deleteLikeInComment = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const updateLikeCommentUseCase = new UpdateLikeCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await updateLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.verifyComment).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.verifyLikeInComment).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.deleteLikeInComment).toBeCalledWith(useCasePayload);
  });
});
