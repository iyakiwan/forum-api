const DetailThread = require('../../../Domains/threads/entities/DetailThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const result = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const comment of comments) {
      result.push({
        ...comment,
        // eslint-disable-next-line no-await-in-loop
        replies: await this._replyRepository.getReplyByCommentId(comment.id),
      });
    }

    await Promise.all(result);
    const detailThread = new DetailThread({
      ...thread,
      comments: result,
    });
    return detailThread;
  }
}

module.exports = GetThreadUseCase;
