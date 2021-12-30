const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const isSuccess = require('../../../config/response');

//* 12. 게시글 작성
exports.createPost = async function (req, res) {
    const id = req.verifiedToken.id;
    const cafeId = req.params.cafeId;
    const categoryId = req.params.categoryId;
    const {
        title, content, img
    } = req.body;
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));
    
    const createPostQuery = `
    insert into postInfo(title, content, userId, img, categoryId, cafeId)
    values (?,?,?,?,?,?);
        `;
    try {
        await pool.query(createPostQuery, [title, content, id, img, categoryId, cafeId]);
        res.send(isSuccess.true(200, "입력성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 

//* 13. 게시글 조회
exports.getPostList = async function (req, res) {    
    const id = req.verifiedToken.id;
    const categoryId = req.params.categoryId;
    const getPostListQuery = `select idx,title, userId, img, viewCount,
    (select count(idx) from commentInfo where commentInfo.postId= postInfo.idx) as commentCount,
     case
         when TIMESTAMPDIFF(HOUR, createdAt, CURRENT_TIMESTAMP) < 24
             then DATE_FORMAT(createdAt, '%H:%i')
         else DATE_FORMAT(createdAt, '%Y.%m.%d')
     end as createTime
    from postInfo
    where categoryId=? and status <> 'DELETED';`;

    try {
        const [getPostListRows] = await pool.query(getPostListQuery,[categoryId]);
        res.send(isSuccess.true(200, "조회성공(입력값 ㅇ)", getPostListRows));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};

//* 14. 게시글 상세조회
exports.getPostInfo = async function (req, res) {    
    const id = req.verifiedToken.id;
    const postId = req.params.postId;
    const getPostInfoQuery = `select title, content, userId, img, viewCount,
    case
        when TIMESTAMPDIFF(HOUR, postInfo.createdAt, CURRENT_TIMESTAMP) < 24
            then DATE_FORMAT(postInfo.createdAt, '%H:%i')
        else DATE_FORMAT(postInfo.createdAt, '%Y.%m.%d')
    end as postCreateTime
    from postInfo
    where idx =? and postInfo.status!= 'DELETED';
    `  ;
    const updateViewQuery=`update postInfo set viewCount=viewCount+1 where postInfo.idx=?`;

    try {
        await pool.query(updateViewQuery,[postId]);
        const [getPostInfoRows] = await pool.query(getPostInfoQuery,[postId]);
        console.log(getPostInfoRows)
        res.send(isSuccess.true(200, "조회성공(입력값 ㅇ)", getPostInfoRows[0]));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
};

//* 15. 게시글 수정
exports.updatePost = async function (req, res) {
    const id = req.verifiedToken.id;
    const postId = req.params.postId;
    const {
        title, content, img
    } = req.body;
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));
    
    const updatePostQuery = `
        update postInfo
        set title=?, content=?, img=?
        where idx=?;
        `;
    try {
        await pool.query(updatePostQuery, [title, content, img, postId]);
        res.send(isSuccess.true(200, "입력성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 

//* 16. 게시글 삭제
exports.deletePost = async function (req, res) {
    const id = req.verifiedToken.id;
    const postId = req.params.postId;
    if (!id) return res.send(isSuccess.false(301, "토큰을 확인해주세요."));
    
    const deletePostQuery = `update postInfo set status='DELETED' where idx=?;`;
    try {
        await pool.query(deletePostQuery, [postId]);
        res.send(isSuccess.true(200, "입력성공"));
    } catch (err) {
        logger.error(`Query error\n: ${JSON.stringify(err)}`);
        return res.send(isSuccess.false(500, `error: ${JSON.stringify(err)}`));
    }
}; 