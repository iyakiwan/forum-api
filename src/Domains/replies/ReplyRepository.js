class ReplyRepository {
  async addReply(newReply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailableReply(reply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReply(replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  // async getIdByUsername(username) {
  //   throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  // }
}

module.exports = ReplyRepository;
