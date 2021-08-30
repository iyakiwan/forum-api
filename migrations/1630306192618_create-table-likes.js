/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes', 'unique_comment_id_and_user_id', 'UNIQUE(comment_id, user_id)');

  pgm.addConstraint('likes', 'fk_likes.comment_id_comment.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'fk_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comment.id');
  pgm.dropConstraint('likes', 'fk_likes.user_id_users.id');

  pgm.dropTable('likes');
};
