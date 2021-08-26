class CommentsHandler {
  constructor({ addCommentUseCase }) {
    this._addCommentUseCase = addCommentUseCase;

    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { content } = request.payload;
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const date = new Date().toISOString();

    const newComment = {
      content, threadId, owner, date,
    };

    const addedComment = await this._addCommentUseCase.execute(newComment);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;
