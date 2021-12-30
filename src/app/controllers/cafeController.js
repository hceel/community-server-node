const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const isSuccess = require('../../../config/response');

//* 7. 카페 생성
exports.createCafe = async function (req, res) {
    const cafename = req.body.cafename;
    if (!cafename) return res.send(isSuccess.false(301, "이름을 입력해주세요."));
    
    const query = `
        insert into cafeInfo(cafeName)
        values (?);
        `;
    try {
        await pool.query(query, [cafename]);
        res.send(isSuccess.true(200, "카페 생성 성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 

// 8. 카페 가입
exports.joinCafe = async function (req, res) {
    const id = req.verifiedToken.id;
    // console.log(id)
    const cafeId = req.params.cafeId;
    const nickname = req.body.nickname;
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));
    if (!cafeId) return res.send(isSuccess.false(302, "카페 존재를 확인해주세요."));
    if (!nickname) return res.send(isSuccess.false(303, "닉네임을 확인해주세요."));
    if (nickname.length > 20) return res.send(isSuccess.false(304, "닉네임은 최대 20자리를 입력해주세요."));
    
    const joinCafeQuery = `
        insert into  userCafeInfo(userId, cafeId,nickname)
        values (?,?,?);
        `;
    try {
        await pool.query(joinCafeQuery, [id, cafeId, nickname]);
        res.send(isSuccess.true(200, "카페 가입 성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 

//* 9. 가입한 카페 리스트 조회
exports.getCafeList = async function (req, res) {
    const id = req.verifiedToken.id;
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));

    const getCafeListQuery =   `select cafeInfo.idx, cafeInfo.cafeName
    from userCafeInfo left join cafeInfo on cafeInfo.idx = userCafeInfo.cafeId
    where userCafeInfo.userId=?;`;

    try {
        const [getCafeListRows] = await pool.query(getCafeListQuery,[id]);
        res.send(isSuccess.true(200, "조회성공(입력값 ㅇ)", getCafeListRows));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};

//* 10. 카테고리 생성
exports.createCategory = async function (req, res) {
    const cafeId = req.params.cafeId;
    const categoryName = req.body.categoryName;
    if (!categoryName) return res.send(isSuccess.false(301, "카테고리 이름을 입력해주세요."));
    
    const createCategoryQuery = `
    insert into categoryInfo(cafeId, categoryName)
    values (?,?);
        `;
    try {
        await pool.query(createCategoryQuery, [cafeId, categoryName]);
        res.send(isSuccess.true(200, "카테고리 생성 성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 

//* 11. 카테고리 조회
exports.getCategoryList = async function (req, res) {
    const cafeId = req.params.cafeId;
    if (!cafeId) return res.send(isSuccess.false(301, "카페를 확인해주세요."));

    const getCategoryListQuery =   `select idx, categoryName
    from categoryInfo
    where cafeId=?;`;

    try {
        const [getCategoryListRows] = await pool.query(getCategoryListQuery,[cafeId]);
        res.send(isSuccess.true(200, "조회성공(입력값 ㅇ)", getCategoryListRows));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};
