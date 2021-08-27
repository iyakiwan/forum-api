const NewReply = require('../../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);
    await this._commentRepository.verifyComment(newReply);
    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
