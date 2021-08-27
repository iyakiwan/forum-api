class ReplyRepository {
  async addReply(newReply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailableReply(Reply) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReply(ReplyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  // async getIdByUsername(username) {
  //   throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  // }
}

module.exports = ReplyRepository;
