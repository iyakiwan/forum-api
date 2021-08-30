/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
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

    for (const comment of comments) {
      result.push({
        ...comment,
        replies: await this._replyRepository.getReplyByCommentId(comment.id),
        likeCount: await this._commentRepository.getCountLikesbyCommentId(comment.id),
      });
    }

    await Promise.all(result);

    return new DetailThread({ ...thread, comments: result });
  }
}

module.exports = GetThreadUseCase;
