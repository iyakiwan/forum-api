class ThreadRepository {
  async addThread(newThread) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailableThread(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  // async getPasswordByUsername(username) {
  //   throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  // }

  // async getIdByUsername(username) {
  //   throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  // }
}

module.exports = ThreadRepository;
