class RepliesHandler {
  constructor({ addReplyUseCase, deleteReplyUseCase }) {
    this._addReplyUseCase = addReplyUseCase;
    this._deleteReplyUseCase = deleteReplyUseCase;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const date = new Date().toISOString();

    const newReply = {
      content, threadId, commentId, owner, date,
    };

    const addedReply = await this._addReplyUseCase.execute(newReply);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const deleteReply = {
      replyId, commentId, threadId, owner,
    };

    await this._deleteReplyUseCase.execute(deleteReply);

    const response = h.response({
      status: 'success',
    });

    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
