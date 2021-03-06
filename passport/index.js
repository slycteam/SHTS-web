const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser((email, done) => {
        User.findOne({
            where: { email },
            // include: [{
            //     model: User,
            //     attributes: ['id', 'displayName'],
            //     as: 'Followers',
            // },
                // {
                // model: User,
                // attributes: ['id', 'displayName'],
                // as: 'Followings',
                // }
            // ],
        })
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local(passport);
    kakao(passport);
};
