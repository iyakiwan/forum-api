class UpdateLikeCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._commentRepository.verifyComment(useCasePayload);
    const verify = await this._commentRepository.verifyLikeInComment(useCasePayload);
    if (verify) {
      await this._commentRepository.deleteLikeInComment(useCasePayload);
    } else {
      await this._commentRepository.addLikeInComment(useCasePayload);
    }
  }
}

module.exports = UpdateLikeCommentUseCase;
