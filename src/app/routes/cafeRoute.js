module.exports = function(app){
    const cafe = require('../controllers/cafeController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/cafe').post(cafe.createCafe);                   //* 7. 카페 생성
    app.route('/cafe/:cafeId').post(jwtMiddleware,cafe.joinCafe);// 8. 카페 가입
    app.get('/cafe', jwtMiddleware, cafe.getCafeList);          //* 9. 가입한 카페 리스트 조회

    app.route('/:cafeId/category').post(cafe.createCategory);   //* 10. 카테고리 생성
    app.get('/:cafeId/category', cafe.getCategoryList);         //* 11. 카테고리 조회
};
