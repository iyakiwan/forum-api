class RepliesHandler {
  constructor({ addReplyUseCase }) {
    this._addReplyUseCase = addReplyUseCase;
    // this._deleteCommentUseCase = deleteCommentUseCase;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    // this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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

  // async deleteCommentHandler(request, h) {
  //   const { id: owner } = request.auth.credentials;
  //   const { threadId, commentId } = request.params;

  //   const deleteComment = {
  //     commentId, threadId, owner,
  //   };

  //   await this._deleteCommentUseCase.execute(deleteComment);

  //   const response = h.response({
  //     status: 'success',
  //   });

  //   response.code(200);
  //   return response;
  // }
}

module.exports = RepliesHandler;
