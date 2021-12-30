module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/signUp').post(user.signUp);                 //* 1. 회원가입  
    app.route('/signIn').post(user.signIn);                 //* 2. 로그인

    app.get('/check', jwtMiddleware, user.check);           //* -. 자동로그인

    app.get('/user', jwtMiddleware, user.getUserInfo);              //* 3. 회원정보 조회
    app.route('/user').patch(jwtMiddleware, user.updateUserInfo);   //* 4. 회원정보 수정
    app.route('/user').delete(jwtMiddleware, user.deleteUserInfo);  //* 5. 회원정보 삭제(탈퇴)
};