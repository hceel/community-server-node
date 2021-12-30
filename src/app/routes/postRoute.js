module.exports = function(app){
    const post = require('../controllers/postController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //  익명 게시판 기준
    app.route('/:cafeId/:categoryId/post').post(jwtMiddleware, post.createPost);    //* 12. 게시글 작성
    app.get('/:categoryId/post', jwtMiddleware, post.getPostList);                  //* 13. 게시글 조회
    app.get('/post/:postId', jwtMiddleware, post.getPostInfo);                      //* 14. 게시글 상세조회
    app.route('/post/:postId').patch(jwtMiddleware, post.updatePost);               //* 15. 게시글 수정
    app.route('/post/:postId').delete(jwtMiddleware, post.deletePost);              //* 16. 게시글 삭제

    app.route('/:postId/comment').post(jwtMiddleware, post.createComment);          //* 17. 댓글 작성
    app.route('/comment/:commentId').patch(jwtMiddleware, post.updateComment);      //* 18. 댓글 수정
    app.route('/comment/:commentId').delete(jwtMiddleware, post.deleteComment);     //* 19. 댓글 삭제
    app.route('/:postId/:commentId/recomment').post(jwtMiddleware, post.createRecomment);   //* 20. 대댓글 작성
    app.get('/:postId/comment', jwtMiddleware, post.getCommentList);                //*21. 댓글창 조회

    app.get('/:cafeId/myPost', jwtMiddleware, post.getMyPostList);                  //* 22. 내가 작성한 글 조회
    app.get('/:cafeId/myCommentPost', jwtMiddleware, post.getMyCommentList);        //* 23. 내가 댓글 단 글 조회
};
