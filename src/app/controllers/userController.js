const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const isSuccess = require('../../../config/response');

//* 1. 회원가입
exports.signUp = async function (req, res) {
    const {
        id,
        password,
        nickname
    } = req.body;

    if (!id) return res.send(isSuccess.false(301, "아이디를 입력해주세요."));
    if (!password) return res.send(isSuccess.false(304, "비밀번호를 입력 해주세요."));
    if (password.length < 6 || password.length > 20) return res.send(isSuccess.false(305, "비밀번호는 6~20자리를 입력해주세요."));
    if (!nickname) return res.send(isSuccess.false(306, "닉네임을 입력 해주세요."));
    if (nickname.length > 20) return res.send(isSuccess.false(307, "닉네임은 최대 20자리를 입력해주세요."));

    const selectIdQuery = `
                SELECT id, nickname 
                FROM userInfo 
                WHERE id = ?;
                `;
    const [idRows] = await pool.query(selectIdQuery, [id]);

    const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
    const signUpQuery = `
                INSERT INTO userInfo(id, password, nickname)
                VALUES (?, ?, ?);`;
    const signUpParams = [id, hashedPassword, nickname];

    try {
        if (idRows.length > 0) {
            return res.send(isSuccess.false(308, "이미 등록된 아이디입니다."));
        } else {
            await pool.query(signUpQuery, signUpParams);
            return res.send(isSuccess.true(200, "회원가입 성공"));
        }
    } catch (err) {
        logger.error(`App - SignUp Query error\n: ${err.message}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};

/**
 update : 2019.11.01
 02.signIn API = 로그인
 **/
exports.signIn = async function (req, res) {
    const {
        id,
        password
    } = req.body;

    if (!id) return res.send(isSuccess.false(301, "아이디를 입력해주세요."));
    if (!password) return res.send(isSuccess.false(304, "비밀번호를 입력 해주세요."));

    const selectUserInfoQuery = `
    SELECT idx , id, nickname, password
    FROM userInfo
    WHERE id = ?;
    `;
    const [userInfoRows] = await pool.query(selectUserInfoQuery, [id]);
    console.log(userInfoRows[0].password)
    const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');

    try {
        if (userInfoRows.length < 1) {
            return res.send(isSuccess.false(310, "아이디를 확인해주세요."));
        } else if (userInfoRows[0].password !== hashedPassword) {
            return res.send(isSuccess.false(311, "비밀번호를 잘못 입력하셨습니다."));
        } else {
            //토큰 생성
            let token = await jwt.sign({
                    id: userInfoRows[0].idx,
                    password: hashedPassword,
                    nickname: userInfoRows[0].nickname,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );
            const signInResult = {
                jwt:token,
                userInfo:userInfoRows[0]
            }
            return res.send(isSuccess.true(200, "로그인성공", signInResult)); //userInfoRows[0]
        }
    } catch (err) {
        logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};

/**
 update : 2019.09.23
 03.check API = token 검증
 **/
exports.check = async function (req, res) {
    res.send(isSuccess.true(200, "검증 성공", req.verifiedToken)); 
};

//* 3. 회원정보 조회
exports.getUserInfo = async function (req, res) {
    const id = req.verifiedToken.id;
    console.log(id)
    const getUserInfoQuery =   `select id, nickname
                    from userInfo
                    where idx =? and status='ACTIVE';`;
    try {
        const [rows]= await pool.query(getUserInfoQuery,[id]);
        res.send(isSuccess.true(200, "조회성공(입력값 ㅇ)", rows[0]));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};

//* 4. 회원정보 수정
exports.updateUserInfo = async function (req, res) {
    const id = req.verifiedToken.id;
    const {
        password, nickname 
    } = req.body;
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));
    
    const updateUserInfoQuery = `update userInfo
        set password=?, nickname=?
        where idx=?;
        `;
    try {
        await pool.query(updateUserInfoQuery, [password, nickname,id]);
        res.send(isSuccess.true(200, "변경성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 

//* 5. 회원정보 삭제(탈퇴)
exports.deleteUserInfo = async function (req, res) {
    const id = req.verifiedToken.id
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));
    
    const deleteUserInfoQuery = `update userInfo
        set status='DELETED'
        where idx=?;
        `;
    try {
        await pool.query(deleteUserInfoQuery, [id]);
        res.send(isSuccess.true(200, "탈퇴성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 