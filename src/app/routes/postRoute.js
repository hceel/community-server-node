module.exports = function(app){
    const post = require('../controllers/postController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //  익명 게시판 기준
    app.route('/:cafeId/:categoryId/post').post(jwtMiddleware, post.createPost);    //* 12. 게시글 작성
    app.get('/:categoryId/post', jwtMiddleware, post.getPostList);                  //* 13. 게시글 조회
    app.get('/post/:postId', jwtMiddleware, post.getPostInfo);                      //* 14. 게시글 상세조회
    app.route('/post/:postId').patch(jwtMiddleware, post.updatePost);               //* 15. 게시글 수정
    app.route('/post/:postId').delete(jwtMiddleware, post.deletePost);              //* 16. 게시글 삭제
};
